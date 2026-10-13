import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { RelatorioTecnicoInstalacaoResponseDto } from "@/module/reports/dto/ordemServicoInstalacao.response.dto";
import { BuscarInstalacaoTecnicaUseCase } from "@/module/reports/useCase";
import { RetiradaService } from "@/module/reports/service/retirada.service";
import { VendasAutonomosService } from "@/module/reports/service/vendas-autonomos.service";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(
    private readonly buscarInstalacaoTecnicaUseCase: BuscarInstalacaoTecnicaUseCase,
    private readonly retiradaService: RetiradaService,
    private readonly vendasAutonomosService: VendasAutonomosService,
  ) {}

  @Get("vendas-autonomos")
  @ApiOperation({ summary: "Listar vendas realizadas por autônomos" })
  buscarVendasAutonomos(@Query() dto: RelatorioTecnicoDto) {
    return this.vendasAutonomosService.buscar(dto);
  }

  @Get("retiradas")
  @ApiOperation({ summary: "Listar retiradas entregues e conciliadas" })
  buscarRetiradas(@Query() dto: RelatorioTecnicoDto) {
    return this.retiradaService.buscar(dto);
  }

  @Get("tecnicos-instalacao")
  @ApiOperation({
    summary: "Listar instalações do fechamento semanal de técnicos",
    description:
      "Consulta a query Fechamento Instalação Técnico no Metabase e restringe o resultado aos usuários com cargo TECNICO cadastrados no banco.",
  })
  @ApiResponse({
    status: 200,
    description: "Instalações listadas com sucesso",
    type: RelatorioTecnicoInstalacaoResponseDto,
  })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  @ApiResponse({ status: 500, description: "Erro ao consultar o Metabase" })
  buscarInstalacaoTecnica(
    @Query() dto: RelatorioTecnicoDto,
  ): Promise<RelatorioTecnicoInstalacaoResponseDto> {
    return this.buscarInstalacaoTecnicaUseCase.execute(dto);
  }
}
