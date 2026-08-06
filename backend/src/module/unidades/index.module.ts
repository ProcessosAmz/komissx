import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unidades } from '@/module/unidades/entities/unidades.entity';
import { UnidadesController } from '@/module/unidades/controller/index.controller';
import { UnidadesService } from '@/module/unidades/service/index.service';

@Module({
  imports: [TypeOrmModule.forFeature([Unidades])],
  controllers: [UnidadesController],
  providers: [UnidadesService],
  exports: [TypeOrmModule, UnidadesService],
})
export class UnidadesModule {}