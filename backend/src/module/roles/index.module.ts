import { Module } from '@nestjs/common';
import { RolesService } from './service/index.service';
import { RolesController } from './controller/index.controller';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
