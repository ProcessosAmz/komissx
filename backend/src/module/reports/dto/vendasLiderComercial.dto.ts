import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { Host } from "@/common/enums/host.enum";
import { emptyToUndefined } from "@/module/reports/dto/helper/emptyToUndefined.helper";

export class RelatorioVendasLider {
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

  @ApiPropertyOptional({
    format: "uuid",
    description:
      "UUID do líder ou supervisor. A consulta usa a equipe vinculada (e a subárvore, no caso de supervisor).",
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => emptyToUndefined(value))
  lider?: string;

  @ApiPropertyOptional({ enum: Host, example: Host.MANIA })
  @IsOptional()
  @IsEnum(Host)
  @Transform(({ value }) => emptyToUndefined(value))
  empresa?: Host;

  @ApiProperty({ example: "2026-08-21" })
  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @ApiProperty({ example: "2026-09-20" })
  @IsDateString()
  @IsNotEmpty()
  dataFim: string;
}
