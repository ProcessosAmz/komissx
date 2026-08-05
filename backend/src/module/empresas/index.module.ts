import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresas } from '@/module/empresas/entities/empresas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empresas])],
  exports: [TypeOrmModule],
})
export class EmpresasModule {}