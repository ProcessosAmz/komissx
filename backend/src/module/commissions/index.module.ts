import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './controller/index.controller';

@Module({
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
