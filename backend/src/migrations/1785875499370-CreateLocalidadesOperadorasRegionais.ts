import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLocalidadesOperadorasRegionais1785875499370 implements MigrationInterface {
    name = 'CreateLocalidadesOperadorasRegionais1785875499370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cidades" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "estado_id" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cc606d4fea4335e32bd19f3a9fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "estados" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "uf" character varying(2) NOT NULL, "pais_id" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3d9a9f2658d5086012f27924d30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "paises" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying(2) NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7ac231d9a191170cb5358845abb" UNIQUE ("name"), CONSTRAINT "UQ_4a92fe9e995d2543b472c3f47ea" UNIQUE ("code"), CONSTRAINT "PK_6b10c7997f3076c02e73c63b043" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "regionais" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "operadora_id" integer NOT NULL, "estado_id" integer, "cidade_id" integer, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d149b5b9436bc4f298a56359920" UNIQUE ("operadora_id", "name"), CONSTRAINT "PK_9e028808b8126dcc9e116007f92" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "operadoras" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f1bab78caffee980514387023f6" UNIQUE ("name"), CONSTRAINT "PK_449ba6af3fcae530db51165f542" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cidades" ADD CONSTRAINT "FK_2e7d637be70af707d91216a1933" FOREIGN KEY ("estado_id") REFERENCES "estados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "estados" ADD CONSTRAINT "FK_bbce197daa94b2daad206f66206" FOREIGN KEY ("pais_id") REFERENCES "paises"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "regionais" ADD CONSTRAINT "FK_45f91d0ad50590cd66388f6763c" FOREIGN KEY ("operadora_id") REFERENCES "operadoras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "regionais" ADD CONSTRAINT "FK_9a071afc392573cb3d73c684263" FOREIGN KEY ("estado_id") REFERENCES "estados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "regionais" ADD CONSTRAINT "FK_7c0ae698fd5ea517da5932b3b77" FOREIGN KEY ("cidade_id") REFERENCES "cidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "regionais" DROP CONSTRAINT "FK_7c0ae698fd5ea517da5932b3b77"`);
        await queryRunner.query(`ALTER TABLE "regionais" DROP CONSTRAINT "FK_9a071afc392573cb3d73c684263"`);
        await queryRunner.query(`ALTER TABLE "regionais" DROP CONSTRAINT "FK_45f91d0ad50590cd66388f6763c"`);
        await queryRunner.query(`ALTER TABLE "estados" DROP CONSTRAINT "FK_bbce197daa94b2daad206f66206"`);
        await queryRunner.query(`ALTER TABLE "cidades" DROP CONSTRAINT "FK_2e7d637be70af707d91216a1933"`);
        await queryRunner.query(`DROP TABLE "operadoras"`);
        await queryRunner.query(`DROP TABLE "regionais"`);
        await queryRunner.query(`DROP TABLE "paises"`);
        await queryRunner.query(`DROP TABLE "estados"`);
        await queryRunner.query(`DROP TABLE "cidades"`);
    }

}
