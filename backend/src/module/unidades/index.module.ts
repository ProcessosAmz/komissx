import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unidades } from '@/module/unidades/entities/unidades.entity';
import { UnidadesController } from './controller/index.controller';
import { UnidadesService } from './service/index.service';

@Module({
  imports: [TypeOrmModule.forFeature([Unidades])],
  controllers: [UnidadesController],
  providers: [UnidadesService],
  exports: [TypeOrmModule, UnidadesService],
})
export class UnidadesModule {}