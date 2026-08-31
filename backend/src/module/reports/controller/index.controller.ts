import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { RelatorioTecnicoInstalacaoResponseDto } from "@/module/reports/dto/ordemServicoInstalacao.response.dto";
import { BuscarInstalacaoTecnicaUseCase } from "@/module/reports/useCase";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(
    private readonly buscarInstalacaoTecnicaUseCase: BuscarInstalacaoTecnicaUseCase,
  ) {}

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
