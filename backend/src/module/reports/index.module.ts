import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ReportsController } from "@/module/reports/controller/index.controller";
import { ReportService } from "@/module/reports/service/reports.service";

@Module({
  imports: [HttpModule],
  controllers: [ReportsController],
  providers: [ReportService],
})
export class ReportsModule {}
