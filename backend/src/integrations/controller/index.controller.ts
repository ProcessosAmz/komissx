import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common';
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
      `POST /ticket recebido numero_ordem_servico=${body.body?.numero_ordem_servico} id_tipo=${body.body?.id_tipo_ordem_servico}`,
    );

    const response = await this.hubsoftService.createTicket(body);

    if (!response) {
      this.logger.log('POST /ticket resultado=Ordem ignorada');
      return { message: 'Ordem ignorada' };
    }

    this.logger.log(
      `POST /ticket resultado=${response.message} duplicate=${response.duplicate === true}`,
    );

    return response;
  }

  @Post('ordens-servico')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'OS de instalação concluída com sucesso ainda sem motivo de auditoria',
  })
  @ApiBody({ type: BuscarOrdensServicoDto })
  @ApiResponse({ status: 200, description: 'Lista de ordens de serviço' })
  async buscarOrdensServico(@Body() body: BuscarOrdensServicoDto) {
    this.logger.log(`POST /ordens-servico recebido host=${body.host}`);

    const ordens = await this.hubsoftService.moverAuditoriasParaFilaQualidade(
      body.host,
    );

    this.logger.log(
      `POST /ordens-servico host=${body.host} total=${ordens.length}`,
    );

    return {
      host: body.host,
      total: ordens.length,
      ordens,
    };
  }
}