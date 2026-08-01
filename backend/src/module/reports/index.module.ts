import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { ReportsController } from "./controller/index.controller";
import { ReportService } from "./service/reports.service";

@Module({
  imports: [HttpModule],
  controllers: [ReportsController],
  providers: [ReportService],
})
export class ReportsModule {}
