import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { FilterUsersDto } from "@/module/users/dto";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { applyFilters, buildTree, toListItem } from "@/module/users/useCase/helper/listUser.helper";
import { getErrorMessage } from "@/utils/error.utils";

@Injectable()
export class ListUsersUseCase {
  private readonly logger = new Logger(ListUsersUseCase.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(filters: FilterUsersDto) {
    this.logger.log("Listing users hierarchy");

    try {
      const users = await this.usersRepository.findAll();
      const mappedUsers = users.map(toListItem);
      const filteredUsers = applyFilters(mappedUsers, filters);
      const tree = buildTree(filteredUsers);

      return {
        data: tree,
        message:
          tree.length === 0
            ? "Nenhum usuário encontrado"
            : "Usuários listados com sucesso",
      };
    } catch (error) {
      const message = getErrorMessage(error);

      this.logger.error(
        `Failed to list users: ${message}`,
        (error as Error)?.stack,
      );

      throw new InternalServerErrorException("Erro ao listar usuários");
    }
  }
}