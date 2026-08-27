import { Injectable, Logger } from "@nestjs/common";
import { MetaService } from "@/integrations/service/metabase.service";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { TecnicoFechamentoResponseDto } from "@/module/reports/dto/ordemServicoInstalacao.response.dto";
import {
  empresaParaConta,
  encontrarLiderLobatos,
  filtrarInstalacoesDosTecnicos,
  mapearInstalacoesTecnicas,
  TECNICO_SINTETICO_LOBATOS,
} from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";
import { Users } from "@/module/users/entities/users.entity";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { getErrorMessage, rethrowOrInternalError } from "@/utils/error.utils";

const CARGO_TECNICO = "TECNICO";

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly metaService: MetaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async buscarInstalacaoTecnica(dto: RelatorioTecnicoDto) {
    this.logger.log(
      `Buscando fechamento de instalação técnico ${dto.dataInicio} a ${dto.dataFim}`,
    );

    try {
      const [fontes, tecnicos] = await Promise.all([
        this.metaService.vendasTecnico(dto),
        this.listarTecnicosDoBanco(),
      ]);
      const instalacoes = fontes.flatMap((fonte) =>
        mapearInstalacoesTecnicas(fonte.rows, fonte.url, fonte.host),
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
        "buscarInstalacaoTecnica",
        "Erro ao buscar fechamento de instalação técnico",
      );
    }
  }

  private async listarTecnicosDoBanco(): Promise<TecnicoFechamentoResponseDto[]> {
    const users = await this.usersRepository.findAll();

    return users
      .filter((user) => this.isTecnicoAtivo(user))
      .map((user) => ({
        id: user.id,
        name: user.name,
        conta: empresaParaConta(user.empresa?.name ?? ""),
      }));
  }

  private isTecnicoAtivo(user: Users): boolean {
    return user.role?.name?.toUpperCase().trim() === CARGO_TECNICO;
  }
}
