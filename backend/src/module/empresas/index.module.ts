import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresas } from '@/module/empresas/entities/empresas.entity';
import { EmpresasController } from './controller/index.controller';
import { EmpresasService } from './service/index.service';

@Module({
  imports: [TypeOrmModule.forFeature([Empresas])],
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [TypeOrmModule, EmpresasService],
})
export class EmpresasModule {}