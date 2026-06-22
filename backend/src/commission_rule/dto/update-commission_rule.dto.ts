import { PartialType } from '@nestjs/mapped-types';
import { CreateCommissionRoleDto } from './create-commission_rule.dto';

export class UpdateCommissionRoleDto extends PartialType(CreateCommissionRoleDto) {}
