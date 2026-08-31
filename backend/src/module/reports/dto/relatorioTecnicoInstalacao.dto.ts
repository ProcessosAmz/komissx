import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Host } from "@/common/enums/host.enum";
import { emptyToUndefined } from "@/module/reports/dto/helper/emptyToUndefined.helper";

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

  @ApiPropertyOptional({ enum: Host, example: Host.MANIA })
  @IsOptional()
  @IsEnum(Host)
  @Transform(({ value }) => emptyToUndefined(value))
  empresa?: Host;

  @ApiProperty({ example: "2026-08-20" })
  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @ApiProperty({ example: "2026-08-26" })
  @IsDateString()
  @IsNotEmpty()
  dataFim: string;
}
