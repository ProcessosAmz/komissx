import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Host } from '@/common/enums/host.enum';
import { BuscarOrdensServicoDto } from '@/integrations/dto/buscarOrdensServico.dto';
import { OrdemServicoWebhook } from '@/integrations/types/OrdemServicoWebhook.type';
import { OrdemServicoListaItem } from '@/integrations/types/OrderServicoLista.type';
import {
  CreateTicketUseCase,
  ListInstallationWithdrawalAuditsUseCase,
  MoveAuditsToQualityQueueUseCase,
} from '@/integrations/useCase';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly moveAuditsToQualityQueueUseCase: MoveAuditsToQualityQueueUseCase,
    private readonly listInstallationWithdrawalAuditsUseCase: ListInstallationWithdrawalAuditsUseCase,
  ) {}

  @Post('ticket')
  @HttpCode(200)
  async createTicket(@Body() body: OrdemServicoWebhook) {
    const response = await this.createTicketUseCase.execute(body);

    if (!response) {
      return { message: 'Ordem ignorada' };
    }

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
  async buscarOrdensServicoPost(@Body() body: BuscarOrdensServicoDto) {
    return this.listarOrdensServico(body.host);
  }

  @Post('ordens-servico-desistencia')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'OS de instalação finalizada com desistência e auditoria 475 ainda aberta',
  })
  @ApiBody({ type: BuscarOrdensServicoDto })
  @ApiResponse({ status: 200, description: 'Lista de ordens de serviço' })
  async buscarOrdensServicoDesistencia(@Body() body: BuscarOrdensServicoDto) {
    const ordens =
      await this.listInstallationWithdrawalAuditsUseCase.execute(body.host);

    return {
      host: body.host,
      total: ordens.length,
      ordens,
    };
  }

  private async listarOrdensServico(host: Host): Promise<{
    host: Host;
    total: number;
    ordens: OrdemServicoListaItem[];
  }> {
    const ordens = await this.moveAuditsToQualityQueueUseCase.execute(host);

    return {
      host,
      total: ordens.length,
      ordens,
    };
  }
}