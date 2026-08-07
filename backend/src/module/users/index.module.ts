import { UsersController } from "@/module/users/controller/index.controller";
import { UserPermission, UserRole, Users } from "@/module/users/entities";
import { UsersService } from "@/module/users/service/index.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "../permissions/entities/permission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, UserRole, UserPermission, Permission]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule],
})
export class UsersModule {}
