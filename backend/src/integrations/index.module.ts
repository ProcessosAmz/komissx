import { Module } from '@nestjs/common';
import { HubsoftService } from './hubsoft.service';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsController } from './index.controller';

@Module({
  imports: [HttpModule],
  controllers: [IntegrationsController],
  providers: [HubsoftService],
  exports: [HubsoftService],
})
export class IntegrationsModule {}