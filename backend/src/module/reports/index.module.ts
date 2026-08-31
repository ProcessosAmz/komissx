import { Module } from "@nestjs/common";
import { MetaService } from "@/integrations/service/metabase.service";
import { ReportsController } from "@/module/reports/controller/index.controller";
import { ReportService } from "@/module/reports/service/reports.service";
import { UsersModule } from "@/module/users/index.module";

@Module({
  imports: [UsersModule],
  controllers: [ReportsController],
  providers: [ReportService, MetaService],
})
export class ReportsModule {}
