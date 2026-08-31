import { Logger } from "@nestjs/common";
import { PoolConfig } from "pg";

const postgresPoolLogger = new Logger("PostgresPool");

export const postgresPoolConfig: Pick<
  PoolConfig,
  | "max"
  | "connectionTimeoutMillis"
  | "idleTimeoutMillis"
  | "keepAlive"
  | "keepAliveInitialDelayMillis"
  | "maxUses"
> = {
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 1000,
  maxUses: 100,
};

export const handlePostgresPoolError = (error: Error): void => {
  postgresPoolLogger.error(
    `Conexão do pool inválida, será descartada: ${error.message}`,
  );
};
