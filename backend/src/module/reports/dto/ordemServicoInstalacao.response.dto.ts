import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Host } from "@/common/enums/host.enum";
import { STATUS_AUDITORIA } from "@/module/reports/constants/statusAuditoria.constants";
import type { StatusAuditoriaResposta } from "@/module/reports/types/statusAuditoriaInstalacao.type";

const STATUS_AUDITORIA_RESPOSTA = [...STATUS_AUDITORIA, ""] as const;

export class TecnicoFechamentoResponseDto {
  @ApiProperty({ example: "3f8a1c2e-4b5d-6e7f-8a9b-0c1d2e3f4a5b" })
  @IsString()
  id: string;

  @ApiProperty({ example: "Edinelson Moura de Lima" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: Host, example: Host.AMAZONET })
  @IsOptional()
  @IsEnum(Host)
  conta?: Host;
}

export class OrdemServicoInstalacaoResponseDto {
  @ApiProperty({ example: "amazonet-177303-003226237083638768-0" })
  @IsString()
  id: string;

  @ApiProperty({ example: "177303" })
  @IsString()
  codigo_cliente: string;

  @ApiProperty({ example: "Manuele Moura de Andrade" })
  @IsString()
  nome_cliente: string;

  @ApiProperty({ example: "003226237083638768" })
  @IsString()
  numero_ordem_servico: string;

  @ApiProperty({ example: "Edinelson Moura de Lima_TEC_TERC_MAO" })
  @IsString()
  usuario_fechamento: string;

  @ApiProperty({ example: "Edinelson Moura de Lima" })
  @IsString()
  usuario_fechamento_limpo: string;

  @ApiProperty({ example: "Rodrigo Araujo da Silva_CMRC_MTA_EXT" })
  @IsString()
  usuario_abertura: string;

  @ApiProperty({ example: "INSTALAÇÃO GRÁTIS" })
  @IsString()
  tipo_ordem_servico: string;

  @ApiProperty({ example: "2026-08-21T15:40:00.000Z" })
  @IsString()
  data_termino_executado: string;

  @ApiProperty({ example: "Monte Alegre" })
  @IsString()
  cidade: string;

  @ApiProperty({ example: "PA" })
  @IsString()
  estado: string;

  @ApiProperty({ example: "Curaxi 2" })
  @IsString()
  bairro: string;

  @ApiProperty({ example: "INSTALAÇÃO CONCLUÍDA COM SUCESSO" })
  @IsString()
  motivo_fechamento: string;

  @ApiProperty({ example: "APROVADO" })
  @IsString()
  etapa_instalacao: string;

  @ApiProperty({ example: "Resolvido" })
  @IsString()
  status_instalacao: string;

  @ApiProperty({ example: "Auditoria - Instalação aprovada" })
  @IsString()
  motivo_instalacao: string;

  @ApiProperty({
    enum: STATUS_AUDITORIA_RESPOSTA,
    example: "APROVADO",
  })
  @IsIn([...STATUS_AUDITORIA, ""])
  status_auditoria: StatusAuditoriaResposta;

  @ApiProperty({ enum: Host, example: Host.AMAZONET })
  @IsEnum(Host)
  conta: Host;

  @ApiProperty({ example: "3f8a1c2e-4b5d-6e7f-8a9b-0c1d2e3f4a5b", nullable: true })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  tecnico_id: string | null;
}

export class RelatorioTecnicoInstalacaoResponseDto {
  @ApiProperty({ type: [OrdemServicoInstalacaoResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoInstalacaoResponseDto)
  data: OrdemServicoInstalacaoResponseDto[];

  @ApiProperty({ type: [TecnicoFechamentoResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TecnicoFechamentoResponseDto)
  tecnicos: TecnicoFechamentoResponseDto[];

  @ApiProperty({ example: "Instalações listadas com sucesso" })
  @IsString()
  message: string;
}
