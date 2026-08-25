import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "@/module/users/dto/createUser.dto";
import { Users } from "@/module/users/entities/users.entity";
import { UpdateUserData } from "@/module/users/types/user";

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

  async findAll(): Promise<Users[]> {
    return this.ormRepository.find({
      where: { active: true },
      relations: {
        role: true,
        empresa: true,
        unidade: {
          estado: true,
        },
      },
      order: { name: "ASC" },
    });
  }

  async countBySupervisorId(supervisorId: string): Promise<number> {
    return this.ormRepository.count({
      where: { supervisorId, active: true },
    });
  }

  async update(user: Users, data: UpdateUserData): Promise<Users> {
    return this.ormRepository.save({
      ...user,
      ...data,
    });
  }
}