import { Controller, Post, Body, Logger, HttpCode } from "@nestjs/common";
import { HubsoftService } from "@/integrations/service/hubsoft.service";
import {
  OrdemServicoWebhook,
  CreateTicketResult,
} from "@/integrations/types/OrdemServicoWebhook.type";

@Controller("integrations")
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(private readonly hubsoftService: HubsoftService) {}

  @Post("ticket")
  @HttpCode(200)
  async createTicket(
    @Body() payload: OrdemServicoWebhook,
  ): Promise<CreateTicketResult | { message: string }> {
    this.logger.log(
      `Received webhook for order ${payload.body.numero_ordem_servico}`,
    );

    const response = await this.hubsoftService.createTicket(payload);

    if (!response) {
      this.logger.log("Ordem ignorada (host inválido ou não é instalação)");
      return { message: "Ordem ignorada" };
    }

    this.logger.log("Ticket created successfully");
    return response;
  }
}
