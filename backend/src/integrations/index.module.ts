import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsController } from '@/integrations/controller/index.controller';
import { HubsoftLogger } from '@/integrations/logger/hubsoft.logger';
import {
  HubsoftGetByIdClienteRepository,
  HubsoftCreateAtendimentoRepository,
  HubsoftGetAtendimentosRepository,
  HubsoftGetAtendimentosCreateTicketRepository,
  HubsoftGetOrdensServicoRepository,
  HubsoftGetAtendimentoByIdRepository,
  HubsoftUpdateAtendimentoRepository,
} from '@/integrations/repository/hubsoft';
import { HubsoftService } from '@/integrations/service/hubsoft.service';
import {
  CreateTicketUseCase,
  MoveAuditsToQualityQueueUseCase,
} from '@/integrations/useCase';

@Module({
  imports: [HttpModule],
  controllers: [IntegrationsController],
  providers: [
    HubsoftService,
    CreateTicketUseCase,
    MoveAuditsToQualityQueueUseCase,
    HubsoftGetByIdClienteRepository,
    HubsoftCreateAtendimentoRepository,
    HubsoftGetAtendimentosRepository,
    HubsoftGetAtendimentosCreateTicketRepository,
    HubsoftGetOrdensServicoRepository,
    HubsoftGetAtendimentoByIdRepository,
    HubsoftUpdateAtendimentoRepository,
    HubsoftLogger,
  ],
  exports: [
    HubsoftService,
    CreateTicketUseCase,
    MoveAuditsToQualityQueueUseCase,
  ],
})
export class IntegrationsModule {}