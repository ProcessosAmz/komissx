import { Controller, Post, Body, HttpCode, Get } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HubsoftService } from '@/integrations/service/hubsoft.service';
import { OrdemServicoWebhook } from '@/integrations/types/OrdemServicoWebhook.type';
import { BuscarOrdensServicoDto } from '@/integrations/dto/buscarOrdensServico.dto';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly hubsoftService: HubsoftService) {}

  @Post('ticket')
  @HttpCode(200)
  async createTicket(@Body() body: OrdemServicoWebhook) {
    const response = await this.hubsoftService.createTicket(body);

    if (!response) {
      return { message: 'Ordem ignorada' };
    }

    return response;
  }

  @Get('ordens-servico')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'OS de instalação concluída com sucesso ainda sem motivo de auditoria',
  })
  @ApiBody({ type: BuscarOrdensServicoDto })
  @ApiResponse({ status: 200, description: 'Lista de ordens de serviço' })
  async buscarOrdensServico(@Body() body: BuscarOrdensServicoDto) {
    const ordens = await this.hubsoftService.moverAuditoriasParaFilaQualidade(
      body.host,
    );

    return {
      host: body.host,
      total: ordens.length,
      ordens,
    };
  }
}