import { Injectable, Logger } from "@nestjs/common";
import { MetaService } from "@/integrations/service/metabase.service";
import {
  CARGO_AUTONOMO,
  CARGO_TECNICO,
} from "@/module/reports/constants/cargoTecnico.constants";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import {
  RelatorioTecnicoInstalacaoResponseDto,
  TecnicoFechamentoResponseDto,
} from "@/module/reports/dto/ordemServicoInstalacao.response.dto";
import {
  encontrarLiderLobatos,
  filtrarInstalacoesDosTecnicos,
  mapearInstalacoesTecnicas,
  TECNICO_SINTETICO_LOBATOS,
} from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";
import { Users } from "@/module/users/entities/users.entity";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { getErrorMessage, rethrowOrInternalError } from "@/utils/error.utils";

@Injectable()
export class BuscarInstalacaoTecnicaUseCase {
  private readonly logger = new Logger(BuscarInstalacaoTecnicaUseCase.name);

  constructor(
    private readonly metaService: MetaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    dto: RelatorioTecnicoDto,
    somenteInstalacao = true,
  ): Promise<RelatorioTecnicoInstalacaoResponseDto> {
    this.logger.log(
      `Buscando fechamento de instalação técnico ${dto.empresa ?? "todas"} ${dto.dataInicio} a ${dto.dataFim}`,
    );

    try {
      const [fontes, tecnicos] = await Promise.all([
        this.metaService.vendasTecnico(dto),
        this.listarTecnicosDoBanco(dto.cargo),
      ]);
      const instalacoes = fontes.flatMap((fonte) =>
        mapearInstalacoesTecnicas(
          fonte.rows,
          fonte.url,
          fonte.host,
          somenteInstalacao,
        ),
      );
      const data = filtrarInstalacoesDosTecnicos(instalacoes, tecnicos);
      const usouSinteticoLobatos = data.some(
        (ordem) => ordem.tecnico_id === TECNICO_SINTETICO_LOBATOS.id,
      );
      const tecnicosResposta =
        encontrarLiderLobatos(tecnicos) || !usouSinteticoLobatos
          ? tecnicos
          : [...tecnicos, TECNICO_SINTETICO_LOBATOS];

      return {
        data,
        tecnicos: tecnicosResposta,
        message:
          data.length === 0
            ? "Nenhuma instalação encontrada para os técnicos cadastrados"
            : "Instalações listadas com sucesso",
      };
    } catch (error) {
      this.logger.error(
        `Falha ao buscar instalação técnico: ${getErrorMessage(error)}`,
        (error as Error)?.stack,
      );
      rethrowOrInternalError(
        error,
        this.logger,
        "BuscarInstalacaoTecnicaUseCase",
        "Erro ao buscar fechamento de instalação técnico",
      );
    }
  }

  private async listarTecnicosDoBanco(
    cargo: RelatorioTecnicoDto["cargo"],
  ): Promise<TecnicoFechamentoResponseDto[]> {
    const users = await this.usersRepository.findAll();

    return users
      .filter((user) => this.isCargoAtivo(user, cargo))
      .map((user) => ({
        id: user.id,
        name: user.name,
      }));
  }

  private isCargoAtivo(
    user: Users,
    cargo: RelatorioTecnicoDto["cargo"],
  ): boolean {
    const cargoEsperado = cargo === "AUTONOMO" ? CARGO_AUTONOMO : CARGO_TECNICO;
    return user.role?.name?.toUpperCase().trim() === cargoEsperado;
  }
}
