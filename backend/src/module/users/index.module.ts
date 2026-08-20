import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BetterAuthRepository } from "@/module/auth/repository/betterAuth.repository";
import { UsersController } from "@/module/users/controller/index.controller";
import { Users, UserRole, UserPermission } from "@/module/users/entities";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { CreateUserUseCase, ListUsersUseCase } from "@/module/users/useCase";

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserRole, UserPermission])],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    UsersRepository,
    BetterAuthRepository,
  ],
  exports: [TypeOrmModule, UsersRepository],
})
export class UsersModule {}