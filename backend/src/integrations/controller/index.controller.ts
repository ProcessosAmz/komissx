import { Controller, Post, Body, Logger, HttpCode, Get } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HubsoftService } from '@/integrations/service/hubsoft.service';
import { OrdemServicoWebhook } from '@/integrations/types/OrdemServicoWebhook.type';
import { BuscarOrdensServicoDto } from '@/integrations/dto/buscarOrdensServico.dto';

@ApiTags('integrations')
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

  @Get('ordens-servico')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Busca OS finalizadas de instalação desde a última quinta',
  })
  @ApiBody({ type: BuscarOrdensServicoDto })
  @ApiResponse({ status: 200, description: 'Lista de ordens de serviço' })
  async buscarOrdensServico(@Body() body: BuscarOrdensServicoDto) {
    const ordens = await this.hubsoftService.buscarOrdensServicoFinalizadas(
      body.host,
    );

    return {
      host: body.host,
      total: ordens.length,
      ordens,
    };
  }
}