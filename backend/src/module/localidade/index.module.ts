import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pais, Estado, Cidade } from '@/module/localidade/entities';
import { LocalidadeController } from './controller/index.controller';
import { LocalidadeService } from './service/index.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pais, Estado, Cidade])],
  controllers: [LocalidadeController],
  providers: [LocalidadeService],
  exports: [TypeOrmModule, LocalidadeService],
})
export class LocalidadeModule {}