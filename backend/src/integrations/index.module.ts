import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HubsoftService } from '@/integrations/service/hubsoft.service';
import { IntegrationsController } from '@/integrations/controller/index.controller';
import { HubsoftLogger } from '@/integrations/logger/hubsoft.logger';
import {
  HubsoftGetByIdClienteRepository,
  HubsoftCreateAtendimentoRepository,
  HubsoftGetAtendimentosRepository,
  HubsoftGetOrdensServicoRepository,
  HubsoftGetAtendimentoByIdRepository,
} from '@/integrations/repository/hubsoft';

@Module({
  imports: [HttpModule],
  controllers: [IntegrationsController],
  providers: [
    HubsoftService,
    HubsoftGetByIdClienteRepository,
    HubsoftCreateAtendimentoRepository,
    HubsoftGetAtendimentosRepository,
    HubsoftGetOrdensServicoRepository,
    HubsoftGetAtendimentoByIdRepository,
    HubsoftLogger,
  ],
  exports: [HubsoftService],
})
export class IntegrationsModule {}