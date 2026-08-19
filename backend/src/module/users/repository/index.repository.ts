import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FilterUsersDto } from "@/module/users/dto/filterUsers.dto";
import { CreateUserDto } from "@/module/users/dto/createUser.dto";
import { Users } from "@/module/users/entities/users.entity";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly ormRepository: Repository<Users>,
  ) {}

  async create(data: CreateUserDto): Promise<Users> {
    return await this.ormRepository.save(this.ormRepository.create(data));
  }

  async findByEmail(email: string): Promise<Users | null> {
    return await this.ormRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<Users | null> {
    return await this.ormRepository.findOne({
      where: { id },
    });
  }

  async findByIdWithRole(id: string): Promise<Users | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: ["role"],
    });
  }

  async findAll(filters: FilterUsersDto): Promise<Users[]> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder("users")
      .leftJoinAndSelect("users.role", "role")
      .leftJoinAndSelect("users.empresa", "empresa")
      .leftJoinAndSelect("users.unidade", "unidade")
      .leftJoinAndSelect("unidade.estado", "estado")
      .where("users.active = :active", { active: true });

    if (filters.empresaId) {
      queryBuilder.andWhere("users.empresaId = :empresaId", {
        empresaId: filters.empresaId,
      });
    }

    if (filters.unidadeId) {
      queryBuilder.andWhere("users.unidadeId = :unidadeId", {
        unidadeId: filters.unidadeId,
      });
    }

    if (filters.estadoId) {
      queryBuilder.andWhere("unidade.estadoId = :estadoId", {
        estadoId: filters.estadoId,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere("users.name ILIKE :search", {
        search: `%${filters.search}%`,
      });
    }

    return queryBuilder.orderBy("users.name", "ASC").getMany();
  }
}