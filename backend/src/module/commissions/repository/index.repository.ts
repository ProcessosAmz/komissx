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

  findById(id: number): Promise<CommissionRule | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  create(data: Partial<CommissionRule>): Promise<CommissionRule> {
    return this.ormRepository.save(this.ormRepository.create(data));
  }

  update(rule: CommissionRule, data: Partial<CommissionRule>): Promise<CommissionRule> {
    return this.ormRepository.save({ ...rule, ...data });
  }
}