import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { RelatorioTecnicoInstalacaoResponseDto } from "@/module/reports/dto/ordemServicoInstalacao.response.dto";
import { RelatorioVendasComercialResponseDto } from "@/module/reports/dto/vendasComercial.response.dto";
import { RelatorioVendasLider } from "@/module/reports/dto/vendasLiderComercial.dto";
import {
  BuscarInstalacaoTecnicaUseCase,
  BuscarVendasLiderComercialUseCase,
} from "@/module/reports/useCase";
import { RetiradaService } from "@/module/reports/service/retirada.service";
import { VendasAutonomosService } from "@/module/reports/service/vendas-autonomos.service";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(
    private readonly buscarInstalacaoTecnicaUseCase: BuscarInstalacaoTecnicaUseCase,
    private readonly buscarVendasLiderComercialUseCase: BuscarVendasLiderComercialUseCase,
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

  @Get("vendas-comercial")
  @ApiOperation({
    summary: "Listar vendas do fechamento comercial por líder ou supervisor",
    description:
      "Consulta as vendas mensais no Metabase e restringe o resultado à equipe vinculada ao líder/supervisor informado. Vendas do próprio líder vêm com venda_do_lider=true.",
  })
  @ApiResponse({
    status: 200,
    description: "Vendas comerciais listadas com sucesso",
    type: RelatorioVendasComercialResponseDto,
  })
  @ApiResponse({ status: 400, description: "Filtro de líder inválido" })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  @ApiResponse({ status: 404, description: "Líder ou supervisor não encontrado" })
  @ApiResponse({ status: 500, description: "Erro ao consultar o Metabase" })
  buscarVendasComercial(
    @Query() dto: RelatorioVendasLider,
  ): Promise<RelatorioVendasComercialResponseDto> {
    return this.buscarVendasLiderComercialUseCase.execute(dto);
  }
}
