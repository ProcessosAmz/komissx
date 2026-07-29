import { Controller, Get, Query } from "@nestjs/common";
import { RelatorioTecnicoDto } from "./dto/relatorio-tecnico-instalacao.dto";
import { ReportService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportService) {}

  @Get("tecnicos-instalacao")
  buscarInstalacaoTecnica(@Query() dto: RelatorioTecnicoDto) {
    return this.reportsService.buscarInstalacaoTecnica(dto);
  }
}
