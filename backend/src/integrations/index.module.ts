import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HubsoftService } from '@/integrations/service/hubsoft.service';
import { IntegrationsController } from '@/integrations/controller/index.controller';
import { HubsoftGetByIdClienteRepository } from '@/integrations/repository/hubsoft/hubsoftGetByIdCliente.repository';
import { HubsoftCreateAtendimentoRepository } from '@/integrations/repository/hubsoft/hubsoftCreateAtendimento.repository';
import { HubsoftLogger } from '@/integrations/logger/hubsoft.logger';

@Module({
  imports: [HttpModule],
  controllers: [IntegrationsController],
  providers: [
    HubsoftService,
    HubsoftGetByIdClienteRepository,
    HubsoftCreateAtendimentoRepository,
    HubsoftLogger,
  ],
  exports: [HubsoftService],
})
export class IntegrationsModule {}