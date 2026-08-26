import { Injectable, Logger } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { getErrorMessage } from "@/utils/error.utils";

const PING_TIMEOUT_MS = 2000;

@Injectable()
export class PostgresHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(PostgresHealthIndicator.name);

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
        `Ping do banco falhou, conexão será renovada no próximo uso: ${getErrorMessage(error)}`,
      );

      return this.getStatus(key, false, {
        message: getErrorMessage(error),
      });
    }
  }
}
