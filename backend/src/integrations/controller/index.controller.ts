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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

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

  @Post(":host/ticket/teste")
  @HttpCode(200)
  async testarRota(@Param("host", new ParseEnumPipe(Host)) host: Host) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      message: "show papai",
      host,
    };
  }

  @Post(":host/ordens-servico")
  @HttpCode(200)
  @ApiOperation({
    summary:
      "OS de instalação concluída com sucesso ainda sem motivo de auditoria",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de ordens de serviço",
  })
  async buscarOrdensServicoPost(
    @Param("host", new ParseEnumPipe(Host)) host: Host,
  ) {
    return this.listarOrdensServico(host);
  }

  private async listarOrdensServico(host: Host) {
    const ordens = await this.moveAuditsToQualityQueueUseCase.execute(host);

    return {
      host,
      total: ordens.length,
      ordens,
    };
  }
}
