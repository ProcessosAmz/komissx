import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unidades } from '@/module/unidades/entities/unidades.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unidades])],
  exports: [TypeOrmModule],
})
export class UnidadesModule {}