import { Injectable } from '@nestjs/common';
import { CreateCommissionRuleDto } from './dto/create-commission_rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission_rule.dto';

@Injectable()
export class CommissionRuleService {
  create(createCommissionRuleDto: CreateCommissionRuleDto) {
    return 'This action adds a new commissionRule';
  }

  findAll() {
    return `This action returns all commissionRule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commissionRule`;
  }

  update(id: number, updateCommissionRuleDto: UpdateCommissionRuleDto) {
    return `This action updates a #${id} commissionRule`;
  }

  remove(id: number) {
    return `This action removes a #${id} commissionRule`;
  }
}
