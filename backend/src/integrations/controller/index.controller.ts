import { Host } from "@/common/enums/host.enum";
import { OrdemServicoWebhook } from "@/integrations/types/OrdemServicoWebhook.type";
import {
  CreateTicketUseCase,
  MoveAuditsToQualityQueueUseCase,
} from "@/integrations/useCase";
import { Public } from "@/module/auth/decorator/public.decorator";
import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@Public()
@ApiTags("integrations")
@Controller("integrations")
export class IntegrationsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly moveAuditsToQualityQueueUseCase: MoveAuditsToQualityQueueUseCase,
  ) {}

  @Post(":host/ticket")
  @HttpCode(200)
  @ApiOperation({
    summary: "Recebe webhook para criação de atendimento de auditoria",
    description:
      "Recebe um webhook do Hubsoft e cria automaticamente o atendimento de auditoria para o host informado na URL.",
  })
  @ApiParam({
    name: "host",
    enum: Host,
    description: "Conta Hubsoft responsável pelo webhook",
    example: Host.MANIA,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        body: {
          $ref: "#/components/schemas/OrdemServicoWebhookSwaggerDto",
        },
      },
      required: ["body"],
    },
    description: "Payload enviado pelo Hubsoft",
  })
  @ApiResponse({
    status: 200,
    description:
      "Atendimento criado com sucesso ou ordem ignorada quando não atende às regras de auditoria.",
    schema: {
      oneOf: [
        {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Atendimento criado com sucesso",
            },
          },
        },
        {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Ordem ignorada",
            },
          },
        },
        {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Webhook já processado",
            },
            duplicate: {
              type: "boolean",
              example: true,
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: "Host inválido ou payload inválido.",
  })
  async createTicket(
    @Param("host", new ParseEnumPipe(Host)) host: Host,
    @Body() body: OrdemServicoWebhook,
  ) {
    const response = await this.createTicketUseCase.execute({
      host,
      payload: body,
    });

    if (!response) {
      return { message: "Ordem ignorada" };
    }

    return response;
  }

  @Post(":host/ordens-servico")
  @HttpCode(200)
  @ApiOperation({
    summary: "Webhook para mover auditoria de venda para a fila qualidade",
    description:
      "Consulta COMERCIAL - AUDITORIA DE VENDA na LISTA DE ESPERA e altera o responsável de todos para FILA QUALIDADE AUDITORIA.",
  })
  @ApiParam({
    name: "host",
    enum: Host,
    description: "Conta Hubsoft responsável pelo webhook",
    example: Host.AMAZONET,
  })
  @ApiResponse({
    status: 200,
    description: "Log das mudanças de fila de todos os atendimentos consultados.",
  })
  @ApiResponse({
    status: 400,
    description: "Host inválido.",
  })
  async moverFilaQualidade(
    @Param("host", new ParseEnumPipe(Host)) host: Host,
  ) {
    const { ordens, mudancas, totalAtualizados } =
      await this.moveAuditsToQualityQueueUseCase.executeMoverTodos(host);

    return {
      host,
      total: ordens.length,
      totalAtualizados,
      mudancas,
      ordens,
    };
  }
}
