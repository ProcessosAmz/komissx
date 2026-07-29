import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { MetaService } from "../integrations/metabase.service";
import { ReportsController } from "./reports.controller";
import { ReportService } from "./reports.service";

@Module({
  imports: [HttpModule],
  controllers: [ReportsController],
  providers: [ReportService, MetaService],
})
export class ReportsModule {}
