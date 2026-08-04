import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1785865267066 implements MigrationInterface {
    name = 'CreateUsersTable1785865267066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "hubsoft_id" integer, "role_id" integer NOT NULL, "operadora_id" integer NOT NULL, "regional_id" integer NOT NULL, "supervisor_id" integer, "participa_fechamento" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a93ce8075df5d4880c4f1590a53" UNIQUE ("hubsoft_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
