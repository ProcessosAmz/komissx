import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '@/module/users/controller/index.controller';
import { UsersService } from '@/module/users/service/index.service';
import { Users, UserRole, UserPermission } from '@/module/users/entities';
import { UsersRepository } from '@/module/users/repository/index.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserRole, UserPermission])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [TypeOrmModule, UsersService, UsersRepository],
})
export class UsersModule {}