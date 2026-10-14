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
  async importSource(closeId: string, dto: import("@/module/financial-closes/dto/import-financial-source.dto").ImportFinancialSourceDto, user: AuthenticatedUser) {
    if (!dto.source?.trim() || dto.source.trim().length < 3) {
      throw new BadRequestException("Identificador da fonte inválido");
    }
    return this.dataSource.transaction(async (manager) => {
      const closes = await manager.query(
        `SELECT c.*,m.key AS modality FROM financial_closes c
         JOIN financial_modalities m ON m.id=c.modality_id WHERE c.id=$1 FOR UPDATE`,
        [closeId],
      );
      if (!closes.length) throw new NotFoundException("Fechamento não encontrado");
      const close = closes[0];
      if (!allowedModalities.includes(close.modality)) throw new BadRequestException("Modalidade fora do escopo autorizado");
      if (["FINALIZADO", "CANCELADO"].includes(close.status)) throw new ConflictException("Fechamento finalizado/cancelado não aceita importação");
      if (!Array.isArray(dto.records)) throw new BadRequestException("Informe a lista de registros da fonte");
      const source = dto.source.trim().toUpperCase();
      const allowedSources = close.modality === "RETIRADA"
        ? ["METABASE_AMZ_RETIRADA", "METABASE_MANIA_RETIRADA", "PLANILHA_RETIRADA", "PLANILHA_ENTREGA", "PLANILHA_ESTOQUE"]
        : ["METABASE_AMZ_AUTONOMO", "METABASE_MANIA_AUTONOMO"];
      if (!allowedSources.includes(source)) {
        throw new BadRequestException("Fonte não permitida para esta modalidade; verifique o mapeamento de origem");
      }
      const status = dto.status ?? "SUCESSO";
      if (["FALHA", "INVALIDO"].includes(status) && dto.records.length > 0) {
        throw new BadRequestException("Fontes com falha/invalidade não podem importar registros para processamento");
      }
      if (status === "SUCESSO" && dto.errorMessage?.trim()) {
        throw new BadRequestException("Uma importação com mensagem de erro deve ser marcada como PARCIAL, FALHA ou INVALIDO");
      }
      const runRows = await manager.query(
        `INSERT INTO financial_source_runs(close_id,source,status,source_updated_at,row_count,error_message,metadata,requested_by,finished_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,now()) RETURNING *`,
        [closeId,source,status,dto.sourceUpdatedAt ?? null,dto.records.length,dto.errorMessage ?? null,JSON.stringify(dto.metadata ?? {}),user.id],
      );
      const run = runRows[0];
      let insertedRecords = 0;
      let createdItems = 0;
      let changedItems = 0;
      const conflicts: Array<{ recordKey: string; reason: string }> = [];
      for (const record of dto.records) {
        const existingRecord = await manager.query(
          "SELECT id,payload_hash FROM financial_source_records WHERE source_run_id=$1 AND source_record_key=$2",
          [run.id,record.recordKey],
        );
        const payloadJson = JSON.stringify(record.payload);
        const payloadHash = payloadJson;
        if (!existingRecord.length) {
          await manager.query(
            "INSERT INTO financial_source_records(source_run_id,source_record_key,payload,payload_hash) VALUES ($1,$2,$3::jsonb,$4)",
            [run.id,record.recordKey,payloadJson,payloadHash],
          );
          insertedRecords++;
        }
        const existingItems = await manager.query(
          `SELECT * FROM financial_close_items WHERE close_id=$1 AND obligation_key=$2 FOR UPDATE`,
          [closeId,record.obligationKey],
        );
        if (!existingItems.length) {
          await manager.query(
            `INSERT INTO financial_close_items(close_id,modality_id,company,obligation_key,os_number,customer_code,customer_name,
             source_payload,source_status,operational_status,financial_status,block_reason,created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,'PENDENTE','BLOQUEADO','Aguardando validação de elegibilidade e cálculo',$10)`,
            [closeId,close.modality_id,close.company,record.obligationKey,record.osNumber ?? null,record.customerCode ?? null,
             record.customerName ?? null,payloadJson,record.sourceStatus ?? null,user.id],
          );
          createdItems++;
          await manager.query(
            `INSERT INTO financial_audit_events(modality_id,close_id,event_type,reason,actor_id,after_state)
             VALUES ($1,$2,'SOURCE_ITEM_IMPORTED','Registro importado; permanece bloqueado até validação de elegibilidade e cálculo',$3,$4::jsonb)`,
            [close.modality_id,closeId,user.id,JSON.stringify({ source, recordKey: record.recordKey, obligationKey: record.obligationKey })],
          );
        } else {
          const existing = existingItems[0];
          const oldPayload = JSON.stringify(existing.source_payload ?? {});
          if (oldPayload !== payloadJson) {
            await manager.query(
              `UPDATE financial_close_items SET operational_status='DIVERGENTE',financial_status='BLOQUEADO',
               block_reason='A fonte apresentou alteração; requer conferência manual',updated_at=now() WHERE id=$1`,
              [existing.id],
            );
            await manager.query(
              `INSERT INTO financial_reviews(close_item_id,decision,reason,previous_value,new_value,reviewed_by,metadata)
               VALUES ($1,'DIVERGENCIA_FONTE','A fonte apresentou alteração; valores originais preservados',$2,$3,$4,$5::jsonb)`,
              [existing.id,null,null,user.id,JSON.stringify({ source, recordKey:record.recordKey, incomingPayload:record.payload })],
            );
            await manager.query(
              `INSERT INTO financial_audit_events(modality_id,close_id,close_item_id,event_type,reason,actor_id,before_state,after_state)
               VALUES ($1,$2,$3,'SOURCE_DIVERGENCE','Importação identificou alteração e bloqueou o item',$4,$5::jsonb,$6::jsonb)`,
              [close.modality_id,closeId,existing.id,user.id,JSON.stringify(existing),JSON.stringify({ incomingPayload:record.payload })],
            );
            conflicts.push({ recordKey: record.recordKey, reason: "Alteração de fonte exige revisão manual" });
            changedItems++;
          }
        }
      }
      return { sourceRunId: run.id, status, received: dto.records.length, insertedRecords, createdItems, changedItems, conflicts };
    });
  }

  async sourceRuns(closeId: string) {
    const close = await this.dataSource.query(
      `SELECT c.id,m.key AS modality FROM financial_closes c
       JOIN financial_modalities m ON m.id=c.modality_id WHERE c.id=$1`,
      [closeId],
    );
    if (!close.length) throw new NotFoundException("Fechamento não encontrado");
    if (!allowedModalities.includes(close[0].modality)) throw new BadRequestException("Modalidade fora do escopo autorizado");
    return this.dataSource.query(
      "SELECT * FROM financial_source_runs WHERE close_id=$1 ORDER BY started_at DESC",
      [closeId],
    );
  }

  async sourceReadiness(closeId: string) {
    const rows = await this.dataSource.query(
      `SELECT c.id, m.key AS modality, c.company
       FROM financial_closes c JOIN financial_modalities m ON m.id=c.modality_id
       WHERE c.id=$1`,
      [closeId],
    );
    if (!rows.length) throw new NotFoundException("Fechamento não encontrado");
    const close = rows[0];
    if (!allowedModalities.includes(close.modality)) throw new BadRequestException("Modalidade fora do escopo autorizado");
    const check = (label: string, names: string[], required = true) => {
      const present = names.every((name) => Boolean(process.env[name]?.trim()));
      return { label, configured: present, required, variables: names };
    };
    const checks = close.modality === "RETIRADA"
      ? [
          check("Metabase Amazonet Retirada", ["METABASE_AMZ_RETIRADA"], false),
          check("Metabase Mania Retirada", ["METABASE_MANIA_RETIRADA"], false),
          check("Planilha de retirada MAO", ["GOOGLE_SHEET_ID_MAO_RET", "GOOGLE_SHEET_NAME_MAO_RET"]),
          check("Planilha de retirada regionais", ["GOOGLE_SHEET_ID_REGIONAIS_RET", "GOOGLE_SHEET_NAME_REGIONAIS_RET"], false),
          check("Credenciais Google Sheets", ["GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY"]),
        ]
      : [
          check("Metabase Amazonet Vendas Autônomos", ["AMAZONET_CARD_VENDAS"]),
          check("Metabase Mania Vendas Autônomos", ["MANIA_CARD_VENDAS"]),
        ];
    const missing = checks.filter((item) => item.required && !item.configured);
    return {
      closeId: close.id,
      modality: close.modality,
      ready: missing.length === 0,
      checkedAt: new Date().toISOString(),
      checks,
      missingRequired: missing.map((item) => item.label),
      note: "Esta verificação confirma apenas a presença de variáveis de configuração; não comprova acesso, atualização ou integridade das fontes.",
    };
  }

}
