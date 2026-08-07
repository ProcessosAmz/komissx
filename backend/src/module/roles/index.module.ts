import { RolesController } from "@/module/roles/controller/index.controller";
import { Role } from "@/module/roles/entities/role.entity";
import { RolesService } from "@/module/roles/service/index.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "../permissions/entities/permission.entity";
import { RolePermission } from "./entities/rolePermission.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Role, RolePermission, Permission])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [TypeOrmModule],
})
export class RolesModule {}
