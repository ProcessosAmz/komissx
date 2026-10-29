import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Host } from "@/common/enums/host.enum";

export class ColaboradorComercialResponseDto {
  @ApiProperty({ example: "7c9e6679-7425-40de-944b-e07fc1f90ae7" })
  @IsString()
  id: string;

  @ApiProperty({ example: "Beatriz Nobre Dos Anjos" })
  @IsString()
  name: string;

  @ApiProperty({ example: "INTERNO" })
  @IsString()
  roleName: string;

  @ApiPropertyOptional({
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  supervisorId: string | null;

  @ApiPropertyOptional({ example: "Jessica Martins", nullable: true })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  supervisorName: string | null;

  @ApiProperty({ example: "Manaus" })
  @IsString()
  unidadeName: string;

  @ApiProperty({ enum: Host, example: Host.AMAZONET })
  @IsEnum(Host)
  conta: Host;

  @ApiProperty({ example: false })
  @IsBoolean()
  isLider: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isSupervisor: boolean;
}

export class VendaComercialResponseDto {
  @ApiProperty({ example: "amazonet-180215-003226292123145460-0" })
  @IsString()
  id: string;

  @ApiProperty({ example: "DESISTÊNCIA" })
  @IsString()
  tipo_ordem_servico: string;

  @ApiProperty({ example: "003226292123145460" })
  @IsString()
  numero_ordem_servico: string;

  @ApiProperty({ example: "3102039" })
  @IsString()
  id_atendimento: string;

  @ApiProperty({ example: "180215" })
  @IsString()
  codigo_cliente: string;

  @ApiProperty({ example: "RAILANY NILO SOARES" })
  @IsString()
  nome_cliente: string;

  @ApiProperty({ example: "185671" })
  @IsString()
  id_cliente: string;

  @ApiProperty({ example: "AMAZONAS 600 Mbps | START (FIDELIDADE)" })
  @IsString()
  nome_servico: string;

  @ApiProperty({ example: "Danilo Conrado de Oliveira_CMRC_MAO" })
  @IsString()
  vendedor: string;

  @ApiProperty({ example: "Danilo Conrado de Oliveira" })
  @IsString()
  vendedor_limpo: string;

  @ApiProperty({ example: "Danilo Conrado de Oliveira_CMRC_MAO" })
  @IsString()
  usuario_cadastro: string;

  @ApiProperty({ example: "Resolvido" })
  @IsString()
  status_atendimento: string;

  @ApiProperty({ example: "DESISTÊNCIA" })
  @IsString()
  status_auditoria: string;

  @ApiProperty({ example: "(Comercial) Desistência" })
  @IsString()
  motivo_fechamento: string;

  @ApiProperty({ example: "2026-10-19T12:31:54" })
  @IsString()
  data_cadastro: string;

  @ApiProperty({ example: "2026-10-19T02:00:00" })
  @IsString()
  data_termino_executado: string;

  @ApiProperty({ example: 110 })
  @IsNumber()
  valor_servico: number;

  @ApiProperty({ enum: Host, example: Host.AMAZONET })
  @IsEnum(Host)
  conta: Host;

  @ApiProperty({
    example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  colaborador_id: string | null;

  @ApiProperty({
    example: false,
    description:
      "Venda do próprio líder/supervisor selecionado. Entra só no total da meta, não na lista da equipe.",
  })
  @IsBoolean()
  venda_do_lider: boolean;
}

export class RelatorioVendasComercialResponseDto {
  @ApiProperty({ type: [VendaComercialResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendaComercialResponseDto)
  data: VendaComercialResponseDto[];

  @ApiProperty({ type: [ColaboradorComercialResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColaboradorComercialResponseDto)
  colaboradores: ColaboradorComercialResponseDto[];

  @ApiPropertyOptional({
    type: ColaboradorComercialResponseDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ColaboradorComercialResponseDto)
  lider: ColaboradorComercialResponseDto | null;

  @ApiProperty({ example: "Vendas comerciais listadas com sucesso" })
  @IsString()
  message: string;
}
