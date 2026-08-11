import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class FilterUsersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  empresaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unidadeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  estadoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
