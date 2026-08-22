import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Role } from "@/module/roles/entities/role.entity";

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly ormRepository: Repository<Role>,
  ) {}

  async findByNames(names: string[]): Promise<Role[]> {
    return this.ormRepository.find({
      where: { name: In(names) },
      select: ["id", "name"],
    });
  }

  async findById(id: string): Promise<Role | null> {
    return this.ormRepository.findOne({
      where: { id },
      select: ["id", "name"],
    });
  }
}