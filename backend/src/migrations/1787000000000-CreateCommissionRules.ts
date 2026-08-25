import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommissionRules1787000000000 implements MigrationInterface {
  name = "CreateCommissionRules1787000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "commission_rules" (
        "id" SERIAL NOT NULL,
        "nome" character varying NOT NULL,
        "evento" character varying NOT NULL,
        "filters" character varying,
        "ruleType" character varying NOT NULL,
        "valor" numeric(10,2),
        "config" jsonb,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_commission_rules" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "commission_rules" ("nome", "evento", "filters", "ruleType", "valor", "config", "ativo")
      VALUES
        ('LOBATOS', 'installation', 'LOBATOS', 'fixed', 90.00, '{"alias":"LOBATOS"}'::jsonb, true),
        ('EDINELSON', 'installation', 'EDINELSON', 'fixed', 50.00, '{"alias":"EDINELSON"}'::jsonb, true),
        ('NADINEI', 'installation', 'NADINEI', 'fixed', 60.00, '{"alias":"NADINEI"}'::jsonb, true),
        ('AM', 'removal', 'AM', 'fixed', 35.00, '{"uf":"AM"}'::jsonb, true),
        ('PA', 'removal', 'PA', 'fixed', 30.00, '{"uf":"PA"}'::jsonb, true),
        ('AUTONOMO PADRAO', 'sale', 'PADRAO', 'fixed', 50.00, '{"padrao":true}'::jsonb, true),
        ('JOSIVAN CARDOSO OLIVEIRA', 'sale', 'JOSIVAN CARDOSO OLIVEIRA', 'fixed', 60.00, '{"email":"josivan.oliveira@autonomo.com.br"}'::jsonb, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "commission_rules"`);
  }
}