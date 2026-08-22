import { Host } from "@/common/enums/host.enum";
import { atendimentoPadraoPorHost } from "@/integrations/constants/hubsoft/atendimentoPadrao.constants";
import { HubsoftLogger } from "@/integrations/logger/hubsoft.logger";
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
    // variavel para adicioanr o id da ingrid da amazonet, que é o usuario que vai abrir o ticket no hubsoft.
    const idUsuarioAbertura = payload.body.id_usuario_abertura;

    //@Raposito
    //camadinha de segurança para evitar que tickets sejam criados em hosts errados (quase impossivel de acontecer, mas é bom ter)
    if (hostDetectado && hostDetectado !== host) {
      logTicketIgnorado(
        this.logger,
        idClienteServico,
        numeroOrdem,
        host,
        `host inconsistente: OS pertence a ${hostDetectado}, recebida em ${host}`,
      );

      return null;
    }

    // Teste temporário:
    // somente a usuária 2166 pode gerar tickets de auditoria na Amazonet.
    // A Mania permanece com o fluxo normal.
    const usuarioTeste = 2166;

    if (host === Host.AMAZONET && idUsuarioAbertura !== usuarioTeste) {
      logTicketIgnorado(
        this.logger,
        idClienteServico,
        numeroOrdem,
        host,
        `usuário ${idUsuarioAbertura ?? "n/a"} não é o usuário de teste ${usuarioTeste}`,
      );

      return null;
    }

    const instalacao = isOrdemDeInstalacao(
      host,
      payload.body.id_tipo_ordem_servico,
    );

    if (!instalacao) {
      logTicketIgnorado(
        this.logger,
        idClienteServico,
        numeroOrdem,
        host,
        `tipo ${payload.body.id_tipo_ordem_servico ?? "n/a"} não é instalação`,
      );
      return null;
    }

    const ordemServicoId = payload.body.id_ordem_servico;
    const claimed = await claimWebhookTicket(
      this.redisService,
      host,
      ordemServicoId,
    );

    if (!claimed) {
      this.logger.log(
        `Ticket duplicado — OS ${numeroOrdem} — webhook já processado (${host})`,
      );
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
        this.logger.log(
          `Ticket erro — OS ${numeroOrdem} — cliente não encontrado id_cliente_servico ${idClienteServico} (${host})`,
        );
        await this.hubsoftLogger.createTicket({
          action: "create_error",
          message: `Cliente não encontrado para id_cliente_servico=${idClienteServico}`,
          host,
          isInstalacao: instalacao,
          payload: payload.body,
          cliente: null,
        });
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
        this.logger.log(
          `Ticket duplicado — OS ${numeroOrdem} — atendimento 475 já existe para o cliente (${host})`,
        );
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

      this.logger.log(
        `Ticket criado — cliente ${atendimento.cliente.codigo_cliente} — OS ${numeroOrdem} (${host})`,
      );

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
      logAndRethrow(this.logger, "Erro ao criar atendimento no Hubsoft", error);
    }
  }
}