import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateIdToUuid1785875861027 implements MigrationInterface {
    name = 'UpdateIdToUuid1785875861027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "operadora_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "operadora_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "regional_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "regional_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "supervisor_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "supervisor_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "supervisor_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "supervisor_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "regional_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "regional_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "operadora_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "operadora_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
    }

}
