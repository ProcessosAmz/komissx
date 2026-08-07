import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HubsoftService } from './service/hubsoft.service';
import { IntegrationsController } from './controller/index.controller';
import { HubsoftClienteRepository } from './repository/hubsoft/hubsoftClienteRepository';

@Module({
  imports: [HttpModule],
  controllers: [IntegrationsController],
  providers: [HubsoftService, HubsoftClienteRepository],
  exports: [HubsoftService],
})
export class IntegrationsModule { }