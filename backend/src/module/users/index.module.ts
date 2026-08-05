import { Module } from '@nestjs/common';
import { UsersController } from '@/module/users/controller/index.controller';
import { UsersService } from '@/module/users/service/index.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@/module/users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
