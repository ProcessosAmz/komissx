import { PartialType } from '@nestjs/mapped-types';
import { CreateCommissionEngineDto } from './create-commission_engine.dto';

export class UpdateCommissionEngineDto extends PartialType(CreateCommissionEngineDto) {}
