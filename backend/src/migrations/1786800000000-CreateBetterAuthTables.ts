import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBetterAuthTables1786800000000 implements MigrationInterface {
  name = "CreateBetterAuthTables1786800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" text NOT NULL PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean NOT NULL,
        "image" text,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "role" text NOT NULL,
        "active" boolean NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "session" (
        "id" text NOT NULL PRIMARY KEY,
        "expiresAt" timestamptz NOT NULL,
        "token" text NOT NULL UNIQUE,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL,
        "ipAddress" text,
        "userAgent" text,
        "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "account" (
        "id" text NOT NULL PRIMARY KEY,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "issuer" text NOT NULL,
        "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" timestamptz,
        "refreshTokenExpiresAt" timestamptz,
        "scope" text,
        "password" text,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "verification" (
        "id" text NOT NULL PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "session_userId_idx" ON "session" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "account_userId_idx" ON "account" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "account_issuer_accountId_idx" ON "account" ("issuer", "accountId")`,
    );

    await queryRunner.query(`
      INSERT INTO "user" (
        "id", "name", "email", "emailVerified", "createdAt", "updatedAt", "role", "active"
      )
      SELECT
        users.id::text,
        users.name,
        users.email,
        true,
        users.created_at,
        users.updated_at,
        UPPER(TRIM(roles.name)),
        users.active
      FROM users
      INNER JOIN roles ON roles.id = users.role_id
    `);

    await queryRunner.query(`
      INSERT INTO "account" (
        "id", "accountId", "providerId", "issuer", "userId", "password", "createdAt", "updatedAt"
      )
      SELECT
        uuid_generate_v4()::text,
        users.id::text,
        'credential',
        'local:credential',
        users.id::text,
        users.password,
        users.created_at,
        users.updated_at
      FROM users
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "verification"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "session"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "account"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}