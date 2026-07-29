import { Module } from '@nestjs/common';
import { CommissionEngineService } from './commission_engine.service';

@Module({
  providers: [CommissionEngineService],
})
export class CommissionEngineModule {}
