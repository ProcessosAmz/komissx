import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  BetterAuthAccount,
  BetterAuthUser,
} from "@/module/auth/entities";
import { BetterAuthRepository } from "@/module/auth/repository/betterAuth.repository";
import { RolesModule } from "@/module/roles/index.module";
import { UsersController } from "@/module/users/controller/index.controller";
import { Users, UserRole, UserPermission } from "@/module/users/entities";
import { UsersRepository } from "@/module/users/repository/index.repository";
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  ListUsersUseCase,
  UpdateUserUseCase,
} from "@/module/users/useCase";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      UserRole,
      UserPermission,
      BetterAuthUser,
      BetterAuthAccount,
    ]),
    RolesModule,
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UsersRepository,  
    BetterAuthRepository,
  ],
  exports: [TypeOrmModule, UsersRepository],
})
export class UsersModule {}