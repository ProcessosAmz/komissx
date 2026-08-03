import { Module } from '@nestjs/common';
import { UsersController } from './controller/index.controller';
import { UsersService } from './service/index.service';


@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
