import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pais, Estado, Cidade } from '@/module/localidade/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Pais, Estado, Cidade])],
  exports: [TypeOrmModule],
})
export class LocalidadeModule {}