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
    summary:
      "Move auditorias para a fila de qualidade e retorna as ordens de serviço",
    description:
      "Busca as ordens de serviço do host informado, identifica as que possuem auditoria e move os atendimentos elegíveis para a fila de qualidade.",
  })
  @ApiParam({
    name: "host",
    enum: Host,
    description: "Conta Hubsoft que será consultada",
    example: Host.MANIA,
  })
  @ApiResponse({
    status: 200,
    description: "Lista de ordens de serviço processadas.",
    schema: {
      type: "object",
      properties: {
        host: {
          type: "string",
          enum: Object.values(Host),
          example: Host.MANIA,
        },
        total: {
          type: "number",
          example: 10,
        },
        ordens: {
          type: "array",
          items: {
            type: "object",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Host inválido.",
  })
  async buscarOrdensServicoPost(
    @Param("host", new ParseEnumPipe(Host)) host: Host,
  ) {
    const ordens = await this.moveAuditsToQualityQueueUseCase.execute(host);

    return {
      host,
      total: ordens.length,
      ordens,
    };
  }
}
