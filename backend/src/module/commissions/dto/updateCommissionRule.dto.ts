import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateCommissionRuleDto {
  @ApiPropertyOptional({ example: "LOBATOS" })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;
}