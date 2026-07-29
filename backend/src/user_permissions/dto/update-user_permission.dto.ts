import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPermissionDto } from './create-user_permission.dto';

export class UpdateUserPermissionDto extends PartialType(CreateUserPermissionDto) {}
