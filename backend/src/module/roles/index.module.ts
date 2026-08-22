import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesController } from "@/module/roles/controller/index.controller";
import { Role } from "@/module/roles/entities/role.entity";
import { RolesRepository } from "@/module/roles/repository/index.repository";
import { FilterRolesUseCase } from "@/module/roles/useCase";

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [FilterRolesUseCase, RolesRepository],
  exports: [TypeOrmModule, RolesRepository],
})
export class RolesModule {}