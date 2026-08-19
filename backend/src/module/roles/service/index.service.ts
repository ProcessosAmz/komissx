import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "@/module/roles/entities/role.entity";
import { getErrorMessage } from "@/utils/error.utils";

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async findAll() {
    this.logger.log("Listing all roles");

    try {
      const roles = await this.rolesRepository.find({
        order: { name: "ASC" },
        select: ["id", "name"],
      });

      if (roles.length === 0) {
        return { data: [], message: "Nenhum cargo encontrado" };
      }

      return {
        data: roles,
        message: "Cargos listados com sucesso",
      };
    } catch (error) {
      const message = getErrorMessage(error);

      this.logger.error(
        `Failed to list roles: ${message}`,
        (error as Error)?.stack,
      );

      throw new InternalServerErrorException("Erro ao listar cargos");
    }
  }
}