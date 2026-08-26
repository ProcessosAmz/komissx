import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { IntegrationsController } from "@/integrations/controller/index.controller";
import { HubsoftLogger } from "@/integrations/logger/hubsoft.logger";
import {
  HubsoftGetByIdClienteRepository,
  HubsoftCreateAtendimentoRepository,
  HubsoftGetAtendimentosCreateTicketRepository,
  HubsoftGetAtendimentosFilaQualidadeRepository,
  HubsoftGetOrdensServicoFilaQualidadeRepository,
  HubsoftGetAtendimentoByIdRepository,
  HubsoftUpdateAtendimentoRepository,
} from "@/integrations/repository/hubsoft";
import { HubsoftService } from "@/integrations/service/hubsoft.service";
import {
  CreateTicketUseCase,
  MoveAuditsToQualityQueueUseCase,
  UpdateAuditTicketUseCase,
  MoveInstallationToQualityQueueUseCase,
  MoveAddressChangeToQualityQueueUseCase,
  UpdateNonComplianceUseCase,
  DispatchQualityQueueUseCase,
} from "@/integrations/useCase";

@Module({
  imports: [HttpModule],
  controllers: [IntegrationsController],
  providers: [
    HubsoftService,
    CreateTicketUseCase,
    MoveAuditsToQualityQueueUseCase,
    UpdateAuditTicketUseCase,
    MoveInstallationToQualityQueueUseCase,
    MoveAddressChangeToQualityQueueUseCase,
    UpdateNonComplianceUseCase,
    DispatchQualityQueueUseCase,
    HubsoftGetByIdClienteRepository,
    HubsoftCreateAtendimentoRepository,
    HubsoftGetAtendimentosCreateTicketRepository,
    HubsoftGetAtendimentosFilaQualidadeRepository,
    HubsoftGetOrdensServicoFilaQualidadeRepository,
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