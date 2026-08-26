import { Injectable, Logger } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { getErrorMessage } from "@/utils/error.utils";

const PING_TIMEOUT_MS = 2000;

@Injectable()
export class PostgresHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(PostgresHealthIndicator.name);
  private renovandoPool: Promise<void> | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async ping(key: string): Promise<HealthIndicatorResult> {
    try {
      await Promise.race([
        this.dataSource.query("SELECT 1"),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`timeout of ${PING_TIMEOUT_MS}ms exceeded`));
          }, PING_TIMEOUT_MS);
        }),
      ]);

      return this.getStatus(key, true);
    } catch (error) {
      this.logger.error(
        `Ping do banco falhou: ${getErrorMessage(error)}`,
      );
      void this.recriarPool();

      return this.getStatus(key, false, {
        message: getErrorMessage(error),
      });
    }
  }

  private recriarPool(): Promise<void> {
    if (this.renovandoPool) {
      return this.renovandoPool;
    }

    this.renovandoPool = (async () => {
      try {
        this.logger.warn("Recriando pool do Postgres (conexões antigas descartadas)");

        if (this.dataSource.isInitialized) {
          await this.dataSource.destroy();
        }

        await this.dataSource.initialize();
        this.logger.log("Pool do Postgres recriado");
      } catch (error) {
        this.logger.error(
          `Falha ao recriar pool do Postgres: ${getErrorMessage(error)}`,
        );
      } finally {
        this.renovandoPool = null;
      }
    })();

    return this.renovandoPool;
  }
}
