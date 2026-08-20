import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { FilterRolesDto } from "@/module/roles/dto/filterRoles.dto";
import { RolesRepository } from "@/module/roles/repository/index.repository";

import { HIERARCHY_ROLE_NAMES } from "@/module/users/const/hierarchyRoleName.const";
import { getErrorMessage } from "@/utils/error.utils";
import { filterBySearch, orderByHierarchy } from "@/module/roles/useCase/helper/filterRoles.helper";

@Injectable()
export class FilterRolesUseCase {
  private readonly logger = new Logger(FilterRolesUseCase.name);

  constructor(private readonly rolesRepository: RolesRepository) { }

  async execute(input: FilterRolesDto) {
    this.logger.log("Listing roles");

    try {
      const roles = await this.rolesRepository.findByNames(HIERARCHY_ROLE_NAMES);
      const orderedRoles = orderByHierarchy(roles);
      const filteredRoles = filterBySearch(orderedRoles, input.search);

      if (filteredRoles.length === 0) {
        return { data: [], message: "Nenhum cargo encontrado" };
      }

      return {
        data: filteredRoles,
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