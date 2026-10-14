import { IsArray, IsDateString, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class FinancialSourceRecordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  recordKey: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(320)
  obligationKey: string;

  @IsObject()
  payload: Record<string, unknown>;

  @IsOptional()
  @IsString()
  osNumber?: string;

  @IsOptional()
  @IsString()
  customerCode?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  sourceStatus?: string;
}

export class ImportFinancialSourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  source: string;

  @IsOptional()
  @IsDateString()
  sourceUpdatedAt?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsIn(["SUCESSO", "PARCIAL", "FALHA", "INVALIDO"])
  status?: "SUCESSO" | "PARCIAL" | "FALHA" | "INVALIDO";

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinancialSourceRecordDto)
  records: FinancialSourceRecordDto[];
}
