import { PoolConfig } from "pg";

export const postgresPoolConfig: Pick<
  PoolConfig,
  | "max"
  | "connectionTimeoutMillis"
  | "idleTimeoutMillis"
  | "keepAlive"
  | "keepAliveInitialDelayMillis"
> = {
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};
