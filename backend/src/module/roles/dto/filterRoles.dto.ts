import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class FilterRolesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}