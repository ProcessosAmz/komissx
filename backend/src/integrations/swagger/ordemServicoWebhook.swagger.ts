import { ApiProperty } from "@nestjs/swagger";

export class OrdemServicoWebhookSwaggerDto {
  @ApiProperty({
    example: 123456,
    description: "ID da ordem de serviço",
  })
  id_ordem_servico: number;

  @ApiProperty({
    example: 1,
    description: "ID do tipo da ordem de serviço",
  })
  id_tipo_ordem_servico: number;

  @ApiProperty({
    example: "Instalação de internet",
    description: "Descrição de abertura da ordem",
  })
  descricao_abertura: string;

  @ApiProperty({
    example: "Instalação FTTH",
    description: "Descrição do serviço",
  })
  descricao_servico: string;

  @ApiProperty({
    example: "Instalação concluída",
    nullable: true,
    description: "Descrição do fechamento da ordem",
  })
  descricao_fechamento: string | null;

  @ApiProperty({
    example: "02:30:00",
    description: "Duração da ordem de serviço",
  })
  duracao: string;

  @ApiProperty({
    example: false,
    nullable: true,
  })
  gera_custo: boolean | null;

  @ApiProperty({
    example: 0,
    nullable: true,
  })
  valor_custo: number | null;

  @ApiProperty({
    example: 1,
    nullable: true,
  })
  id_forma_cobranca: number | null;

  @ApiProperty({
    example: "OS-123456",
    description: "Número da ordem de serviço",
  })
  numero_ordem_servico: string;

  @ApiProperty({
    example: 123,
    description: "Usuário responsável pela abertura",
  })
  id_usuario_abertura: number;

  @ApiProperty({
    example: 456,
    nullable: true,
  })
  id_usuario_fechamento: number | null;

  @ApiProperty({
    example: "2026-08-21 10:00:00",
  })
  data_cadastro: string;

  @ApiProperty({
    example: "Concluída",
  })
  status: string;

  @ApiProperty({
    example: "Finalizada",
    nullable: true,
  })
  status_fechamento: string | null;

  @ApiProperty({
    example: 98765,
    description: "ID do cliente/serviço",
  })
  id_cliente_servico: number;

  @ApiProperty({
    example: 54321,
    description: "ID do atendimento relacionado",
  })
  id_atendimento: number;

  @ApiProperty({
    example: 1,
    description: "ID da prioridade",
  })
  id_prioridade: number;

  @ApiProperty({
    example: "2026-08-21 10:00:00",
  })
  data_inicio_programado: string;

  @ApiProperty({
    example: "2026-08-21 12:00:00",
  })
  data_termino_programado: string;

  @ApiProperty({
    example: "2026-08-21 10:15:00",
    nullable: true,
  })
  data_inicio_executado: string | null;

  @ApiProperty({
    example: "2026-08-21 12:30:00",
    nullable: true,
  })
  data_termino_executado: string | null;

  @ApiProperty({
    example: 10,
    nullable: true,
  })
  id_pop: number | null;

  @ApiProperty({
    example: 20,
    nullable: true,
  })
  id_prospecto: number | null;
}
