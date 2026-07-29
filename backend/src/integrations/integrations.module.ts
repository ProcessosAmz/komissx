import { Module } from '@nestjs/common';
import { HubsoftService } from './hubsoft.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [HubsoftService],
  exports: [HubsoftService],
})
export class IntegrationsModule {}