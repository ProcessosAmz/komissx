import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min } from "class-validator";

export const FINANCIAL_MODALITIES = ["RETIRADA", "VENDAS_AUTONOMOS"] as const;
export type FinancialModality = (typeof FINANCIAL_MODALITIES)[number];

export class CreateFinancialCloseDto {
  @IsIn(FINANCIAL_MODALITIES)
  modality: FinancialModality;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  company: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsDateString()
  competenceStart: string;

  @IsDateString()
  competenceEnd: string;
}

export class CreateManualFinancialItemDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  obligationKey: string;

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
  @IsObject()
  sourcePayload?: Record<string, unknown>;
}

export class ReviewFinancialItemDto {
  @IsIn(["LIBERAR", "MANTER_BLOQUEADO", "REJEITAR"])
  decision: "LIBERAR" | "MANTER_BLOQUEADO" | "REJEITAR";

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
