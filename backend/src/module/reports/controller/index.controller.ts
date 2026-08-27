import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { ReportService } from "@/module/reports/service/reports.service";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportService) {}

  @Get("tecnicos-instalacao")
  @ApiOperation({
    summary: "Listar instalações do fechamento semanal de técnicos",
    description:
      "Consulta a query Fechamento Instalação Técnico no Metabase e restringe o resultado aos usuários com cargo TECNICO cadastrados no banco.",
  })
  @ApiResponse({ status: 200, description: "Instalações listadas com sucesso" })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  @ApiResponse({ status: 500, description: "Erro ao consultar o Metabase" })
  buscarInstalacaoTecnica(@Query() dto: RelatorioTecnicoDto) {
    return this.reportsService.buscarInstalacaoTecnica(dto);
  }
}
