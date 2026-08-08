import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { HubsoftService } from '@/integrations/service/hubsoft.service';
import { OrdemServicoWebhook } from '@/integrations/types/OrdemServicoWebhook.type';

@Controller('integrations')
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(private readonly hubsoftService: HubsoftService) {}

  @Post('ticket')
  @HttpCode(200)
  async createTicket(@Body() body: OrdemServicoWebhook) {
    this.logger.log(
      `Received webhook for order ${body?.body?.numero_ordem_servico}`,
    );

    const response = await this.hubsoftService.createTicket(body);

    if (!response) {
      this.logger.log('Ordem ignorada (host inválido ou não é instalação)');
      return { message: 'Ordem ignorada' };
    }

    this.logger.log('Ticket created successfully');
    return response;
  }
}