import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommissionRule } from "@/module/commissions/entities/comissionRule.entity";

@Injectable()
export class CommissionRulesRepository {
  constructor(
    @InjectRepository(CommissionRule)
    private readonly ormRepository: Repository<CommissionRule>,
  ) {}

  findActive(): Promise<CommissionRule[]> {
    return this.ormRepository.find({
      where: { ativo: true },
      order: { evento: "ASC", nome: "ASC" },
    });
  }
}