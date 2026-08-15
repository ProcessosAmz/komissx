import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HubsoftService } from '@/integrations/service/hubsoft.service';
import { IntegrationsController } from '@/integrations/controller/index.controller';
import { HubsoftGetByIdClienteRepository } from '@/integrations/repository/hubsoft/hubsoftGetByIdCliente.repository';
import { HubsoftCreateAtendimentoRepository } from '@/integrations/repository/hubsoft/hubsoftCreateAtendimento.repository';
import { HubsoftGetAtendimentosRepository } from '@/integrations/repository/hubsoft/hubsoftGetAtendimentos.repository';
import { HubsoftLogger } from '@/integrations/logger/hubsoft.logger';
import { HubsoftGetOrdensServicoRepository } from '@/integrations/repository/hubsoft/hubsoftGetOrdensServico.repository';

@Module({
  imports: [HttpModule],
  controllers: [IntegrationsController],
  providers: [
    HubsoftService,
    HubsoftGetByIdClienteRepository,
    HubsoftCreateAtendimentoRepository,
    HubsoftGetAtendimentosRepository,
    HubsoftGetOrdensServicoRepository,
    HubsoftLogger,
  ],
  exports: [HubsoftService],
})
export class IntegrationsModule {}