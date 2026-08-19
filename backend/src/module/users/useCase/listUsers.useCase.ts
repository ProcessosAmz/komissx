import {
    Injectable,
    InternalServerErrorException,
    Logger,
  } from "@nestjs/common";
  import { FilterUsersDto } from "@/module/users/dto";
  import { Users } from "@/module/users/entities/users.entity";
  import { UsersRepository } from "@/module/users/repository/index.repository";
  import { UserListItem } from "@/module/users/types/user";
  import { getErrorMessage } from "@/utils/error.utils";
  
  @Injectable()
  export class ListUsersUseCase {
    private readonly logger = new Logger(ListUsersUseCase.name);
  
    constructor(private readonly usersRepository: UsersRepository) {}
  
    async execute(filters: FilterUsersDto) {
      this.logger.log("Listing users hierarchy");
  
      try {
        const users = await this.usersRepository.findAll(filters);
        const mappedUsers = users.map((user) => this.toListItem(user));
        const tree = this.buildTree(mappedUsers);
  
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
  
    private toListItem(user: Users): UserListItem {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        hubsoftId: user.hubsoftId,
        roleId: user.roleId,
        roleName: user.role?.name ?? "",
        empresaId: user.empresaId,
        empresaName: user.empresa?.name ?? "",
        unidadeId: user.unidadeId,
        unidadeName: user.unidade?.name ?? "",
        estadoId: user.unidade?.estadoId ?? null,
        estadoName: user.unidade?.estado?.name ?? null,
        supervisorId: user.supervisorId,
        participaFechamento: user.participaFechamento,
        active: user.active,
      };
    }
  
    private buildTree(users: UserListItem[]): UserListItem[] {
      const nodesById = new Map(
        users.map((user) => [user.id, { ...user, children: [] as UserListItem[] }]),
      );
      const roots: UserListItem[] = [];
  
      nodesById.forEach((node) => {
        const parent = node.supervisorId
          ? nodesById.get(node.supervisorId)
          : undefined;
  
        if (parent) {
          parent.children?.push(node);
          return;
        }
  
        roots.push(node);
      });
  
      return roots;
    }
  }