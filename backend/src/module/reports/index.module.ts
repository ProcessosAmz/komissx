import { Module } from "@nestjs/common";
import { MetaService } from "@/module/reports/service/metabase.service";
import { RetiradaService } from "@/module/reports/service/retirada.service";
import { VendasAutonomosService } from "@/module/reports/service/vendas-autonomos.service";
import { ReportsController } from "@/module/reports/controller/index.controller";
import { BuscarInstalacaoTecnicaUseCase } from "@/module/reports/useCase";
import { UsersModule } from "@/module/users/index.module";

@Module({
  imports: [UsersModule],
  controllers: [ReportsController],
  providers: [BuscarInstalacaoTecnicaUseCase, MetaService, RetiradaService, VendasAutonomosService],
})
export class ReportsModule {}
