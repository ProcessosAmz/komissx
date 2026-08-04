import { PartialType } from '@nestjs/mapped-types';
import { CreateCommissionDto } from './createCommission.dto';

export class UpdateCommissionDto extends PartialType(CreateCommissionDto) {}