import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Persistência exclusiva para Retirada e Vendas Autônomos.
 * Não altera tabelas ou fluxos do fechamento Técnico Terceirizados.
 */
export class CreateFinancialClosesRetiradaAutonomos1792000000000 implements MigrationInterface {
  name = "CreateFinancialClosesRetiradaAutonomos1792000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE financial_modalities (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key varchar(40) NOT NULL UNIQUE CHECK (key IN ('RETIRADA','VENDAS_AUTONOMOS')), name varchar(120) NOT NULL, enabled boolean NOT NULL DEFAULT true, config jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())");
    await queryRunner.query("INSERT INTO financial_modalities (key, name, config) VALUES ('RETIRADA','Fechamento de Retirada','{\"sourcePolicy\":\"METABASE_AND_SPREADSHEETS\",\"paymentRequiresReceiptAndStockMovement\":true}'::jsonb), ('VENDAS_AUTONOMOS','Fechamento de Vendas Autônomos','{\"sourcePolicy\":\"METABASE_ONLY\"}'::jsonb)");

    await queryRunner.query("CREATE TABLE financial_beneficiaries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(180) NOT NULL, type varchar(40) NOT NULL, external_identifier varchar(180), active boolean NOT NULL DEFAULT true, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())");
    await queryRunner.query("CREATE UNIQUE INDEX uq_financial_beneficiary_external ON financial_beneficiaries(type, external_identifier) WHERE external_identifier IS NOT NULL");
    await queryRunner.query("CREATE TABLE financial_beneficiary_mappings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), modality_id uuid NOT NULL REFERENCES financial_modalities(id), source varchar(80) NOT NULL, source_identifier varchar(180) NOT NULL, beneficiary_id uuid NOT NULL REFERENCES financial_beneficiaries(id), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid, UNIQUE(modality_id, source, source_identifier))");
    await queryRunner.query("CREATE TABLE financial_rule_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), modality_id uuid NOT NULL REFERENCES financial_modalities(id), version integer NOT NULL, rules jsonb NOT NULL, effective_from date, effective_until date, active boolean NOT NULL DEFAULT true, created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(modality_id, version))");

    await queryRunner.query("CREATE TABLE financial_closes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), modality_id uuid NOT NULL REFERENCES financial_modalities(id), company varchar(80) NOT NULL, period_start date NOT NULL, period_end date NOT NULL, competence_start date NOT NULL, competence_end date NOT NULL, status varchar(40) NOT NULL DEFAULT 'PREPARACAO' CHECK (status IN ('PREPARACAO','CONFERENCIA','CALCULADO','RELATORIO_GERADO','EM_REVISAO','AUTORIZADO','FINALIZADO','REABERTO','CANCELADO')), rule_version_id uuid REFERENCES financial_rule_versions(id), report_generated_at timestamptz, report_snapshot jsonb, created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK(period_start <= period_end AND competence_start <= competence_end))");
    await queryRunner.query("CREATE INDEX ix_financial_closes_lookup ON financial_closes(modality_id, company, period_start, period_end)");
    await queryRunner.query("CREATE UNIQUE INDEX uq_financial_close_active_period ON financial_closes(modality_id, company, period_start, period_end) WHERE status <> 'CANCELADO'");
    await queryRunner.query("CREATE TABLE financial_source_runs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), close_id uuid NOT NULL REFERENCES financial_closes(id), source varchar(100) NOT NULL, status varchar(30) NOT NULL CHECK(status IN ('EXECUTANDO','SUCESSO','PARCIAL','FALHA','INVALIDO')), started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, source_updated_at timestamptz, row_count integer NOT NULL DEFAULT 0, error_message text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, requested_by uuid)");
    await queryRunner.query("CREATE TABLE financial_source_records (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_run_id uuid NOT NULL REFERENCES financial_source_runs(id), source_record_key varchar(240) NOT NULL, payload jsonb NOT NULL, payload_hash varchar(128), imported_at timestamptz NOT NULL DEFAULT now(), UNIQUE(source_run_id, source_record_key))");

    await queryRunner.query("CREATE TABLE financial_close_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), close_id uuid NOT NULL REFERENCES financial_closes(id), modality_id uuid NOT NULL REFERENCES financial_modalities(id), company varchar(80) NOT NULL, obligation_key varchar(320) NOT NULL, os_number varchar(120), customer_code varchar(120), customer_name varchar(240), beneficiary_id uuid REFERENCES financial_beneficiaries(id), beneficiary_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, source_competence_date date, source_payload jsonb NOT NULL DEFAULT '{}'::jsonb, source_status varchar(60), operational_status varchar(40) NOT NULL DEFAULT 'PENDENTE' CHECK(operational_status IN ('PENDENTE','CONFERIDO','DIVERGENTE','BLOQUEADO','LIBERADO','REJEITADO')), financial_status varchar(40) NOT NULL DEFAULT 'BLOQUEADO' CHECK(financial_status IN ('BLOQUEADO','PENDENTE_REVISAO','APROVADO','AUTORIZADO','PENDENTE_PAGAMENTO','PAGO','ESTORNADO','ENCERRADO_SEM_APLICACAO')), block_reason text, calculated_amount numeric(14,2), rule_snapshot jsonb, manual_entry boolean NOT NULL DEFAULT false, created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(close_id, obligation_key))");
    await queryRunner.query("CREATE INDEX ix_financial_close_items_obligation ON financial_close_items(modality_id, obligation_key)");
    await queryRunner.query("CREATE INDEX ix_financial_close_items_beneficiary ON financial_close_items(beneficiary_id, financial_status)");
    await queryRunner.query("CREATE TABLE financial_reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), close_item_id uuid NOT NULL REFERENCES financial_close_items(id), decision varchar(60) NOT NULL, reason text NOT NULL, previous_value numeric(14,2), new_value numeric(14,2), reviewed_by uuid NOT NULL, reviewed_at timestamptz NOT NULL DEFAULT now(), metadata jsonb NOT NULL DEFAULT '{}'::jsonb)");

    await queryRunner.query("CREATE TABLE financial_payments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), close_id uuid NOT NULL REFERENCES financial_closes(id), beneficiary_id uuid NOT NULL REFERENCES financial_beneficiaries(id), beneficiary_snapshot jsonb NOT NULL, status varchar(30) NOT NULL DEFAULT 'AUTORIZADO' CHECK(status IN ('AUTORIZADO','PAGO','ESTORNO_PENDENTE','ESTORNADO','CANCELADO')), amount numeric(14,2) NOT NULL CHECK(amount >= 0), authorized_by uuid, authorized_at timestamptz, confirmed_by uuid, confirmed_at timestamptz, reversal_reason text, reversed_by uuid, reversed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())");
    await queryRunner.query("CREATE TABLE financial_payment_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), payment_id uuid NOT NULL REFERENCES financial_payments(id), close_item_id uuid NOT NULL REFERENCES financial_close_items(id), amount numeric(14,2) NOT NULL CHECK(amount >= 0), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(payment_id, close_item_id))");
    await queryRunner.query("CREATE INDEX ix_financial_payment_items_item ON financial_payment_items(close_item_id)");

    await queryRunner.query("CREATE TABLE financial_adjustments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), modality_id uuid NOT NULL REFERENCES financial_modalities(id), obligation_key varchar(320) NOT NULL, origin_close_id uuid REFERENCES financial_closes(id), origin_close_item_id uuid REFERENCES financial_close_items(id), movement_type varchar(20) NOT NULL CHECK(movement_type IN ('AJUSTE','REVERSAO')), status varchar(40) NOT NULL DEFAULT 'PENDENTE_CONFERENCIA' CHECK(status IN ('PENDENTE_CONFERENCIA','EM_REVISAO','APROVADO','CONFIRMADO','APLICADO','BLOQUEADO','REJEITADO','ENCERRADO_SEM_APLICACAO')), reason text NOT NULL, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), current_version integer NOT NULL DEFAULT 1)");
    await queryRunner.query("CREATE TABLE financial_adjustment_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), adjustment_id uuid NOT NULL REFERENCES financial_adjustments(id), version integer NOT NULL, amount numeric(14,2) NOT NULL, reason text NOT NULL, source_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, approved_by uuid, approved_at timestamptz, confirmed_by uuid, confirmed_at timestamptz, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(adjustment_id, version))");
    await queryRunner.query("CREATE TABLE financial_adjustment_applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), adjustment_version_id uuid NOT NULL REFERENCES financial_adjustment_versions(id), target_close_id uuid REFERENCES financial_closes(id), applied_amount numeric(14,2) NOT NULL, applied_by uuid NOT NULL, applied_at timestamptz NOT NULL DEFAULT now(), metadata jsonb NOT NULL DEFAULT '{}'::jsonb)");

    await queryRunner.query("CREATE TABLE financial_close_documents (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), close_id uuid NOT NULL REFERENCES financial_closes(id), payment_id uuid REFERENCES financial_payments(id), document_type varchar(40) NOT NULL, version integer NOT NULL DEFAULT 1, storage_reference text, snapshot jsonb NOT NULL, generated_by uuid NOT NULL, generated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(close_id, payment_id, document_type, version))");
    await queryRunner.query("CREATE TABLE financial_audit_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), modality_id uuid NOT NULL REFERENCES financial_modalities(id), close_id uuid REFERENCES financial_closes(id), close_item_id uuid REFERENCES financial_close_items(id), adjustment_id uuid REFERENCES financial_adjustments(id), payment_id uuid REFERENCES financial_payments(id), event_type varchar(100) NOT NULL, reason text, before_state jsonb, after_state jsonb, actor_id uuid, occurred_at timestamptz NOT NULL DEFAULT now(), metadata jsonb NOT NULL DEFAULT '{}'::jsonb)");
    await queryRunner.query("CREATE INDEX ix_financial_audit_close_time ON financial_audit_events(close_id, occurred_at)");
    await queryRunner.query("CREATE INDEX ix_financial_adjustments_obligation ON financial_adjustments(modality_id, obligation_key)");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS financial_audit_events");
    await queryRunner.query("DROP TABLE IF EXISTS financial_close_documents");
    await queryRunner.query("DROP TABLE IF EXISTS financial_adjustment_applications");
    await queryRunner.query("DROP TABLE IF EXISTS financial_adjustment_versions");
    await queryRunner.query("DROP TABLE IF EXISTS financial_adjustments");
    await queryRunner.query("DROP TABLE IF EXISTS financial_payment_items");
    await queryRunner.query("DROP TABLE IF EXISTS financial_payments");
    await queryRunner.query("DROP TABLE IF EXISTS financial_reviews");
    await queryRunner.query("DROP TABLE IF EXISTS financial_close_items");
    await queryRunner.query("DROP TABLE IF EXISTS financial_source_records");
    await queryRunner.query("DROP TABLE IF EXISTS financial_source_runs");
    await queryRunner.query("DROP TABLE IF EXISTS financial_closes");
    await queryRunner.query("DROP TABLE IF EXISTS financial_rule_versions");
    await queryRunner.query("DROP TABLE IF EXISTS financial_beneficiary_mappings");
    await queryRunner.query("DROP TABLE IF EXISTS financial_beneficiaries");
    await queryRunner.query("DROP TABLE IF EXISTS financial_modalities");
  }
}
