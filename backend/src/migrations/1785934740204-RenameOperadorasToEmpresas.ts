import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameOperadorasToEmpresas1785934740204 implements MigrationInterface {
    name = 'RenameOperadorasToEmpresas1785934740204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "regionais" DROP CONSTRAINT "FK_45f91d0ad50590cd66388f6763c"`);
        await queryRunner.query(`ALTER TABLE "regionais" DROP CONSTRAINT "UQ_d149b5b9436bc4f298a56359920"`);
        await queryRunner.query(`ALTER TABLE "regionais" RENAME COLUMN "operadora_id" TO "empresa_id"`);
        await queryRunner.query(`CREATE TABLE "empresas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4bd95d4c5ef8c64166c719a0918" UNIQUE ("name"), CONSTRAINT "PK_ce7b122b37c6499bfd6520873e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "regionais" ADD CONSTRAINT "UQ_cd8d81091fc8f2a79f2ca5512ec" UNIQUE ("empresa_id", "name")`);
        await queryRunner.query(`ALTER TABLE "regionais" ADD CONSTRAINT "FK_47b48e48d1c5e7acc62068976af" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "regionais" DROP CONSTRAINT "FK_47b48e48d1c5e7acc62068976af"`);
        await queryRunner.query(`ALTER TABLE "regionais" DROP CONSTRAINT "UQ_cd8d81091fc8f2a79f2ca5512ec"`);
        await queryRunner.query(`DROP TABLE "empresas"`);
        await queryRunner.query(`ALTER TABLE "regionais" RENAME COLUMN "empresa_id" TO "operadora_id"`);
        await queryRunner.query(`ALTER TABLE "regionais" ADD CONSTRAINT "UQ_d149b5b9436bc4f298a56359920" UNIQUE ("name", "operadora_id")`);
        await queryRunner.query(`ALTER TABLE "regionais" ADD CONSTRAINT "FK_45f91d0ad50590cd66388f6763c" FOREIGN KEY ("operadora_id") REFERENCES "operadoras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
