import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from '@/module/roles/service/index.service';
import { RolesController } from '@/module/roles/controller/index.controller';
import { Role } from '@/module/roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [TypeOrmModule],
})
export class RolesModule {}