import { PartialType } from '@nestjs/mapped-types';
import { CreateCommissionRuleDto } from './create-commission_rule.dto';

export class UpdateCommissionRuleDto extends PartialType(CreateCommissionRuleDto) {}
