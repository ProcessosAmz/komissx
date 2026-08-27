import { Injectable, Logger } from "@nestjs/common";
import { MetaService } from "@/integrations/service/metabase.service";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { TecnicoFechamentoResponseDto } from "@/module/reports/dto/ordemServicoInstalacao.response.dto";
import {
  filtrarInstalacoesDosTecnicos,
  mapearInstalacoesTecnicas,
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
      const [rows, tecnicos] = await Promise.all([
        this.metaService.vendasTecnico(dto),
        this.listarTecnicosDoBanco(),
      ]);
      const url = this.metaService.getInstalacaoTecnicoUrl();
      const instalacoes = mapearInstalacoesTecnicas(rows, url);
      const data = filtrarInstalacoesDosTecnicos(instalacoes, tecnicos);

      return {
        data,
        tecnicos,
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
      }));
  }

  private isTecnicoAtivo(user: Users): boolean {
    return user.role?.name?.toUpperCase().trim() === CARGO_TECNICO;
  }
}
