import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersRelations1785940648614 implements MigrationInterface {
  name = "AddUsersRelations1785940648614";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "unidades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "empresa_id" uuid NOT NULL, "estado_id" uuid, "cidade_id" uuid, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_534faf9e35facd8dc41b32ff231" UNIQUE ("empresa_id", "name"), CONSTRAINT "PK_3e728a664b48bbd90a355065233" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "operadora_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "regional_id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "empresa_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "unidade_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_47392add05643b67732b121fd13" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_07fe364ae6950cc14ac7658a58e" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_9a1bf4d0601de6693fc9b31d7f5" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "unidades" ADD CONSTRAINT "FK_2a09046c5e0fc56421f6f8708eb" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "unidades" ADD CONSTRAINT "FK_ad1c076dbe767c085b6914e8aa5" FOREIGN KEY ("estado_id") REFERENCES "estados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "unidades" ADD CONSTRAINT "FK_ccf9352ea2560cdc7e3db9b8d4e" FOREIGN KEY ("cidade_id") REFERENCES "cidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "unidades" DROP CONSTRAINT "FK_ccf9352ea2560cdc7e3db9b8d4e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unidades" DROP CONSTRAINT "FK_ad1c076dbe767c085b6914e8aa5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unidades" DROP CONSTRAINT "FK_2a09046c5e0fc56421f6f8708eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_9a1bf4d0601de6693fc9b31d7f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_07fe364ae6950cc14ac7658a58e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_47392add05643b67732b121fd13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "unidade_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "empresa_id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "regional_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "operadora_id" uuid NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "unidades"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
