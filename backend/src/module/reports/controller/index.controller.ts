import { Controller, Get, Query } from "@nestjs/common";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { ReportService } from "@/module/reports/service/reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportService) {}

  @Get("tecnicos-instalacao")
  buscarInstalacaoTecnica(@Query() dto: RelatorioTecnicoDto) {
    return this.reportsService.buscarInstalacaoTecnica(dto);
  }
}
