import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { RelatorioVendasComercialResponseDto } from "@/module/reports/dto/vendasComercial.response.dto";
import { RelatorioVendasLider } from "@/module/reports/dto/vendasLiderComercial.dto";
import { MetaService } from "@/module/reports/service/metabase.service";
import {
  filtrarVendasDaEquipe,
  isLiderRole,
  isSupervisorRole,
  mapearVendasComerciais,
  resolverEquipeComercial,
  toColaboradorComercial,
  UsuarioHierarquiaComercial,
} from "@/module/reports/useCase/helper/mapearVendasComercial.helper";
import { Users } from "@/module/users/entities/users.entity";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { getErrorMessage, rethrowOrInternalError } from "@/utils/error.utils";

@Injectable()
export class BuscarVendasLiderComercialUseCase {
  private readonly logger = new Logger(BuscarVendasLiderComercialUseCase.name);

  constructor(
    private readonly metaService: MetaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    dto: RelatorioVendasLider,
  ): Promise<RelatorioVendasComercialResponseDto> {
    this.logger.log(
      `Buscando vendas comercial ${dto.empresa ?? "todas"} ${dto.dataInicio} a ${dto.dataFim}${dto.lider ? ` lider=${dto.lider}` : ""}`,
    );

    if (dto.dataInicio > dto.dataFim) {
      throw new BadRequestException(
        "A data inicial deve ser anterior ou igual à data final",
      );
    }

    try {
      const [fontes, usuarios] = await Promise.all([
        this.metaService.vendasLiderComercial(dto),
        this.listarUsuariosComerciais(),
      ]);
      const equipe = resolverEquipeComercial(usuarios, dto.lider);

      if (dto.lider && !equipe.selecionado) {
        throw new NotFoundException("Líder ou supervisor não encontrado");
      }

      if (
        equipe.selecionado &&
        !isLiderRole(equipe.selecionado.roleName) &&
        !isSupervisorRole(equipe.selecionado.roleName)
      ) {
        throw new BadRequestException(
          "O filtro lider deve ser um usuário com cargo de líder ou supervisor",
        );
      }

      const vendas = fontes.flatMap((fonte) =>
        mapearVendasComerciais(fonte.rows, fonte.url, fonte.host),
      );
      const data = filtrarVendasDaEquipe(
        vendas,
        equipe.paraMatch,
        equipe.selecionado?.id,
      );

      return {
        data,
        colaboradores: equipe.equipe.map(toColaboradorComercial),
        lider: equipe.selecionado
          ? toColaboradorComercial(equipe.selecionado)
          : null,
        message:
          data.length === 0
            ? "Nenhuma venda encontrada para a equipe comercial"
            : "Vendas comerciais listadas com sucesso",
      };
    } catch (error) {
      this.logger.error(
        `Falha ao buscar vendas comercial: ${getErrorMessage(error)}`,
        (error as Error)?.stack,
      );
      rethrowOrInternalError(
        error,
        this.logger,
        "BuscarVendasLiderComercialUseCase",
        "Erro ao buscar vendas comercial no Metabase",
      );
    }
  }

  private async listarUsuariosComerciais(): Promise<
    UsuarioHierarquiaComercial[]
  > {
    const users = await this.usersRepository.findAll();
    const nomesPorId = new Map(users.map((user) => [user.id, user.name]));

    return users.map((user) => this.toUsuarioHierarquia(user, nomesPorId));
  }

  private toUsuarioHierarquia(
    user: Users,
    nomesPorId: Map<string, string>,
  ): UsuarioHierarquiaComercial {
    return {
      id: user.id,
      name: user.name,
      roleName: user.role?.name ?? "",
      supervisorId: user.supervisorId,
      supervisorName: user.supervisorId
        ? (nomesPorId.get(user.supervisorId) ?? null)
        : null,
      unidadeName: user.unidade?.name ?? "",
      empresaName: user.empresa?.name ?? "",
    };
  }
}
