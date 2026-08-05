import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '@/module/users/controller/index.controller';
import { UsersService } from '@/module/users/service/index.service';
import { Users, UserRole, UserPermission } from '@/module/users/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserRole, UserPermission])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule],
})
export class UsersModule {}