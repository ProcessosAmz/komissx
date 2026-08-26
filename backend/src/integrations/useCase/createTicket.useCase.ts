import { Host } from "@/common/enums/host.enum";
import { atendimentoPadraoPorHost } from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { HubsoftLogger } from "@/integrations/logger/hubsoft.logger";
import { hubsoftConsole } from "@/integrations/logger/hubsoftConsole.logger";
import { RedisService } from "@/integrations/redis/service/index.service";
import {
  HubsoftCreateAtendimentoRepository,
  HubsoftGetAtendimentosCreateTicketRepository,
  HubsoftGetByIdClienteRepository,
} from "@/integrations/repository/hubsoft";
import {
  claimWebhookTicket,
  isOrdemDeInstalacao,
  releaseWebhookTicket,
  resolveOrdemServicoHost,
} from "@/integrations/service/helper";
import { HubsoftService } from "@/integrations/service/hubsoft.service";
import {
  CreateTicketResult,
  OrdemServicoWebhook,
} from "@/integrations/types/OrdemServicoWebhook.type";
import {
  logAndRethrow,
  logTicketIgnorado,
} from "@/integrations/useCase/helper";
import { getErrorMessage } from "@/utils/error.utils";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CreateTicketUseCase {
  private readonly logger = new Logger(CreateTicketUseCase.name);

  constructor(
    private readonly hubsoftService: HubsoftService,
    private readonly hubsoftGetByIdClienteRepository: HubsoftGetByIdClienteRepository,
    private readonly hubsoftCreateAtendimentoRepository: HubsoftCreateAtendimentoRepository,
    private readonly hubsoftGetAtendimentosCreateTicketRepository: HubsoftGetAtendimentosCreateTicketRepository,
    private readonly hubsoftLogger: HubsoftLogger,
    private readonly redisService: RedisService,
  ) {}

  async execute({
    host,
    payload,
  }: {
    host: Host;
    payload: OrdemServicoWebhook;
  }): Promise<CreateTicketResult | null> {
    const numeroOrdem = payload.body.numero_ordem_servico;
    const idClienteServico = payload.body.id_cliente_servico;
    const hostDetectado = resolveOrdemServicoHost(numeroOrdem);
    const idUsuarioAbertura = payload.body.id_usuario_abertura;

    hubsoftConsole.start(
      host,
      "create",
      `OS ${numeroOrdem} | cliente ${idClienteServico}`,
    );
    hubsoftConsole.info(
      host,
      "create",
      `usuário abertura ${idUsuarioAbertura ?? "n/a"} | tipo OS ${payload.body.id_tipo_ordem_servico ?? "n/a"}`,
    );

    if (hostDetectado && hostDetectado !== host) {
      logTicketIgnorado(
        idClienteServico,
        numeroOrdem,
        host,
        `host inconsistente: OS pertence a ${hostDetectado}, recebida em ${host}`,
      );
      hubsoftConsole.end(host, "create", "ignorado");
      return null;
    }

    const instalacao = isOrdemDeInstalacao(
      host,
      payload.body.id_tipo_ordem_servico,
    );

    if (!instalacao) {
      logTicketIgnorado(
        idClienteServico,
        numeroOrdem,
        host,
        `tipo ${payload.body.id_tipo_ordem_servico ?? "n/a"} não é instalação`,
      );
      hubsoftConsole.end(host, "create", "ignorado");
      return null;
    }

    const ordemServicoId = payload.body.id_ordem_servico;
    const claimed = await claimWebhookTicket(
      this.redisService,
      host,
      ordemServicoId,
    );

    if (!claimed) {
      hubsoftConsole.skip(
        host,
        "create",
        `duplicado — webhook já processado | OS ${numeroOrdem}`,
      );
      hubsoftConsole.end(host, "create", "duplicado");
      return {
        message: "Webhook já processado",
        duplicate: true,
      };
    }

    try {
      const token = await this.hubsoftService.garantirTokenValido(host);
      const atendimentoPadrao = atendimentoPadraoPorHost[host];
      const cliente = await this.hubsoftGetByIdClienteRepository.execute(
        host,
        idClienteServico,
        token,
      );

      if (!cliente) {
        await releaseWebhookTicket(this.redisService, host, ordemServicoId);
        hubsoftConsole.error(
          host,
          "create",
          `cliente não encontrado | id_cliente_servico ${idClienteServico}`,
        );
        await this.hubsoftLogger.createTicket({
          action: "create_error",
          message: `Cliente não encontrado para id_cliente_servico=${idClienteServico}`,
          host,
          isInstalacao: instalacao,
          payload: payload.body,
          cliente: null,
        });
        hubsoftConsole.end(host, "create", "erro");
        return null;
      }

      const hoje = new Date().toISOString().slice(0, 10);
      const atendimentosExistentes =
        await this.hubsoftGetAtendimentosCreateTicketRepository.execute(
          host,
          {
            pagina: 1,
            itens_por_pagina: 50,
            data_inicio: hoje,
            data_fim: hoje,
            tipo_atendimento: String(atendimentoPadrao.id_tipo_atendimento),
            status_atendimento: String(atendimentoPadrao.id_atendimento_status),
            id_servico: idClienteServico,
            tipo_data: "data_cadastro",
          },
          token,
        );
      const jaExisteNesteCliente = atendimentosExistentes.some(
        (atendimento) =>
          Number(atendimento.servico?.id_cliente_servico) === idClienteServico,
      );

      if (jaExisteNesteCliente) {
        hubsoftConsole.skip(
          host,
          "create",
          `duplicado — auditoria já existe para o cliente | OS ${numeroOrdem}`,
        );
        hubsoftConsole.end(host, "create", "duplicado");
        return {
          message: "Atendimento de auditoria já existe para o cliente",
          duplicate: true,
        };
      }

      const atendimento = await this.hubsoftCreateAtendimentoRepository.execute(
        host,
        {
          id_cliente_servico: idClienteServico,
          id_usuario_abertura: payload.body.id_usuario_abertura,
          ...atendimentoPadrao,
          nome: cliente.nome,
          telefone: cliente.telefone,
          email: cliente.email,
        },
        token,
      );

      await this.hubsoftLogger.createTicket({
        action: "create",
        message: "Atendimento criado com sucesso",
        host,
        isInstalacao: instalacao,
        payload: payload.body,
        cliente,
        atendimento,
      });

      hubsoftConsole.success(
        host,
        "create",
        `ticket criado | cliente ${atendimento.cliente.codigo_cliente} | OS ${numeroOrdem} | protocolo ${atendimento.protocolo ?? "n/a"}`,
      );
      hubsoftConsole.end(host, "create", "sucesso");

      return {
        message: "Atendimento criado com sucesso",
      };
    } catch (error) {
      await releaseWebhookTicket(this.redisService, host, ordemServicoId);
      await this.hubsoftLogger.createTicket({
        action: "create_error",
        message: `Erro ao criar atendimento no Hubsoft: ${getErrorMessage(error)}`,
        host,
        isInstalacao: instalacao,
        payload: payload.body,
      });
      hubsoftConsole.end(host, "create", "erro");
      logAndRethrow(this.logger, "Erro ao criar atendimento no Hubsoft", error, host);
    }
  }
}
