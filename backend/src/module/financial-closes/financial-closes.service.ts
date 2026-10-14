import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { AuthenticatedUser } from "@/module/auth/types/authenticatedUser.type";
import {
  CreateFinancialCloseDto,
  CreateManualFinancialItemDto,
  FinancialModality,
  ReviewFinancialItemDto,
} from "@/module/financial-closes/dto/financial-close.dto";

const allowedModalities: FinancialModality[] = ["RETIRADA", "VENDAS_AUTONOMOS"];

@Injectable()
export class FinancialClosesService {
  constructor(private readonly dataSource: DataSource) {}

  async list(modality?: string) {
    if (modality && !allowedModalities.includes(modality as FinancialModality)) {
      throw new BadRequestException("Modalidade fora do escopo autorizado");
    }
    return this.dataSource.query(
      `SELECT c.*, m.key AS modality, m.name AS modality_name
       FROM financial_closes c JOIN financial_modalities m ON m.id = c.modality_id
       WHERE ($1::varchar IS NULL OR m.key = $1)
       ORDER BY c.created_at DESC LIMIT 200`,
      [modality ?? null],
    );
  }

  async create(dto: CreateFinancialCloseDto, user: AuthenticatedUser) {
    if (!allowedModalities.includes(dto.modality)) throw new BadRequestException("Modalidade fora do escopo autorizado");
    if (dto.periodStart > dto.periodEnd || dto.competenceStart > dto.competenceEnd) {
      throw new BadRequestException("As datas iniciais devem ser anteriores ou iguais às datas finais");
    }
    return this.dataSource.transaction(async (manager) => {
      const modalities = await manager.query(
        "SELECT id FROM financial_modalities WHERE key=$1 AND enabled=true FOR SHARE",
        [dto.modality],
      );
      if (!modalities.length) throw new BadRequestException("Modalidade não cadastrada ou desativada");
      const existing = await manager.query(
        `SELECT id FROM financial_closes WHERE modality_id=$1 AND company=$2
         AND period_start=$3 AND period_end=$4 AND status <> 'CANCELADO' LIMIT 1 FOR UPDATE`,
        [modalities[0].id, dto.company.trim(), dto.periodStart, dto.periodEnd],
      );
      if (existing.length) throw new ConflictException("Já existe fechamento para a modalidade, empresa e período informados");
      const rows = await manager.query(
        `INSERT INTO financial_closes
         (modality_id,company,period_start,period_end,competence_start,competence_end,status,created_by)
         VALUES ($1,$2,$3,$4,$5,$6,'PREPARACAO',$7) RETURNING *`,
        [modalities[0].id, dto.company.trim(), dto.periodStart, dto.periodEnd, dto.competenceStart, dto.competenceEnd, user.id],
      );
      await manager.query(
        `INSERT INTO financial_audit_events(modality_id,close_id,event_type,reason,actor_id,after_state)
         VALUES ($1,$2,'CLOSE_CREATED','Criação do fechamento',$3,$4::jsonb)`,
        [modalities[0].id, rows[0].id, user.id, JSON.stringify({ ...dto, status: "PREPARACAO" })],
      );
      return rows[0];
    });
  }

  async addManualItem(closeId: string, dto: CreateManualFinancialItemDto, user: AuthenticatedUser) {
    return this.dataSource.transaction(async (manager) => {
      const closes = await manager.query(
        `SELECT c.*,m.key AS modality FROM financial_closes c
         JOIN financial_modalities m ON m.id=c.modality_id WHERE c.id=$1 FOR UPDATE`,
        [closeId],
      );
      if (!closes.length) throw new NotFoundException("Fechamento não encontrado");
      const close = closes[0];
      if (!allowedModalities.includes(close.modality)) throw new BadRequestException("Modalidade fora do escopo autorizado");
      if (["FINALIZADO", "CANCELADO"].includes(close.status)) throw new ConflictException("Fechamento finalizado/cancelado não aceita inclusão");
      const rows = await manager.query(
        `INSERT INTO financial_close_items
         (close_id,modality_id,company,obligation_key,os_number,customer_code,customer_name,
          source_payload,operational_status,financial_status,block_reason,manual_entry,created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,'BLOQUEADO','BLOQUEADO',$9,true,$10) RETURNING *`,
        [close.id,close.modality_id,close.company,dto.obligationKey.trim(),dto.osNumber ?? null,
         dto.customerCode ?? null,dto.customerName ?? null,JSON.stringify(dto.sourcePayload ?? {}),
         dto.reason.trim(),user.id],
      );
      await manager.query(
        "INSERT INTO financial_reviews(close_item_id,decision,reason,reviewed_by,metadata) VALUES ($1,'INCLUSAO_MANUAL',$2,$3,'{\"source\":\"manual\"}'::jsonb)",
        [rows[0].id,dto.reason.trim(),user.id],
      );
      await manager.query(
        `INSERT INTO financial_audit_events(modality_id,close_id,close_item_id,event_type,reason,actor_id,after_state)
         VALUES ($1,$2,$3,'MANUAL_ITEM_ADDED',$4,$5,$6::jsonb)`,
        [close.modality_id,close.id,rows[0].id,dto.reason.trim(),user.id,JSON.stringify(rows[0])],
      );
      return rows[0];
    });
  }

  async reviewItem(itemId: string, dto: ReviewFinancialItemDto, user: AuthenticatedUser) {
    return this.dataSource.transaction(async (manager) => {
      const rows = await manager.query(
        `SELECT i.*,c.status AS close_status FROM financial_close_items i
         JOIN financial_closes c ON c.id=i.close_id WHERE i.id=$1 FOR UPDATE`,
        [itemId],
      );
      if (!rows.length) throw new NotFoundException("Item financeiro não encontrado");
      const item = rows[0];
      if (["PAGO","ESTORNADO"].includes(item.financial_status)) throw new ConflictException("Item pago ou estornado não pode ser alterado");
      if (["FINALIZADO","CANCELADO"].includes(item.close_status)) throw new ConflictException("Fechamento finalizado/cancelado não aceita revisão");
      const amount = dto.amount === undefined ? item.calculated_amount : dto.amount;
      const operational = dto.decision === "LIBERAR" ? "LIBERADO" : dto.decision === "REJEITAR" ? "REJEITADO" : "BLOQUEADO";
      const financial = dto.decision === "LIBERAR" ? "APROVADO" : dto.decision === "REJEITAR" ? "ENCERRADO_SEM_APLICACAO" : "BLOQUEADO";
      const updated = await manager.query(
        "UPDATE financial_close_items SET operational_status=$2,financial_status=$3,calculated_amount=$4,block_reason=$5,updated_at=now() WHERE id=$1 RETURNING *",
        [itemId,operational,financial,amount,dto.decision === "LIBERAR" ? null : dto.reason.trim()],
      );
      await manager.query(
        `INSERT INTO financial_reviews(close_item_id,decision,reason,previous_value,new_value,reviewed_by)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [itemId,dto.decision,dto.reason.trim(),item.calculated_amount,amount,user.id],
      );
      await manager.query(
        `INSERT INTO financial_audit_events(modality_id,close_id,close_item_id,event_type,reason,actor_id,before_state,after_state)
         VALUES ($1,$2,$3,'ITEM_REVIEWED',$4,$5,$6::jsonb,$7::jsonb)`,
        [item.modality_id,item.close_id,itemId,dto.reason.trim(),user.id,JSON.stringify(item),JSON.stringify(updated[0])],
      );
      return updated[0];
    });
  }
}
