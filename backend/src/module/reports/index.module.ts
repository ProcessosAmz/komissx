import { Module } from "@nestjs/common";
import { MetaService } from "@/integrations/service/metabase.service";
import { ReportsController } from "@/module/reports/controller/index.controller";
import { BuscarInstalacaoTecnicaUseCase } from "@/module/reports/useCase";
import { UsersModule } from "@/module/users/index.module";

@Module({
  imports: [UsersModule],
  controllers: [ReportsController],
  providers: [BuscarInstalacaoTecnicaUseCase, MetaService],
})
export class ReportsModule {}
