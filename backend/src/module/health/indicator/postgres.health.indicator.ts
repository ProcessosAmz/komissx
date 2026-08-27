import { Injectable, Logger } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { getErrorMessage } from "@/utils/error.utils";

const PING_TIMEOUT_MS = 3000;
const FALHAS_ANTES_RECRIAR = 2;

@Injectable()
export class PostgresHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(PostgresHealthIndicator.name);
  private renovandoPool: Promise<void> | null = null;
  private falhasSeguidas = 0;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async ping(key: string): Promise<HealthIndicatorResult> {
    if (this.renovandoPool) {
      try {
        await this.comTimeout(this.renovandoPool, PING_TIMEOUT_MS);
      } catch {
        return this.getStatus(key, false, {
          message: "reconectando o pool do Postgres",
        });
      }
    }

    try {
      await this.comTimeout(
        this.dataSource.query("SELECT 1"),
        PING_TIMEOUT_MS,
      );
      this.falhasSeguidas = 0;
      return this.getStatus(key, true);
    } catch (error) {
      const message = getErrorMessage(error);

      if (this.isDriverSolto(message)) {
        void this.recriarPool();
        return this.getStatus(key, false, {
          message: "reconectando o pool do Postgres",
        });
      }

      this.falhasSeguidas += 1;
      this.logger.error(
        `Ping do banco falhou (${this.falhasSeguidas}): ${message}`,
      );

      if (this.falhasSeguidas >= FALHAS_ANTES_RECRIAR) {
        void this.recriarPool();
      }

      return this.getStatus(key, false, { message });
    }
  }

  private isDriverSolto(message: string): boolean {
    return (
      !this.dataSource.isInitialized ||
      message.includes("Driver not Connected")
    );
  }

  private comTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`timeout of ${timeoutMs}ms exceeded`));
        }, timeoutMs);
      }),
    ]);
  }

  private recriarPool(): Promise<void> {
    if (this.renovandoPool) {
      return this.renovandoPool;
    }

    this.renovandoPool = (async () => {
      try {
        this.logger.warn(
          "Recriando pool do Postgres (conexões antigas descartadas)",
        );

        if (this.dataSource.isInitialized) {
          await this.dataSource.destroy();
        }

        if (!this.dataSource.isInitialized) {
          await this.dataSource.initialize();
        }

        this.falhasSeguidas = 0;
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
