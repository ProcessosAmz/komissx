import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

function emptyToUndefined(value: unknown): unknown {
  if (value === "") {
    return undefined;
  }

  return value;
}

export class RelatorioTecnicoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyToUndefined(value))
  estado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyToUndefined(value))
  cidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => emptyToUndefined(value))
  tecnico?: string;

  @ApiProperty({ example: "2026-08-20" })
  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @ApiProperty({ example: "2026-08-27" })
  @IsDateString()
  @IsNotEmpty()
  dataFim: string;
}
