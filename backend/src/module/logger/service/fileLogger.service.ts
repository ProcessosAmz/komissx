import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { FileLogInput } from '@/module/logger/dto/fileLog.dto';
import { MountedLogger } from '@/module/logger/type/mountedLogger.type';

@Injectable()
export class FileLoggerService {
  private readonly nestLogger = new Logger(FileLoggerService.name);

  async log(input: FileLogInput): Promise<string> {
    const mounted = this.mountLogger(input);
    const payload = this.buildPayload(input, mounted);

    await fs.mkdir(mounted.folderPath, { recursive: true });
    await fs.writeFile(
      mounted.filePath,
      `${JSON.stringify(payload, null, 2)}\n`,
      'utf8',
    );

    this.nestLogger.log(`Log escrito em: ${mounted.filePath}`);
    return mounted.filePath;
  }

  async logForEntity<TEntity extends { id: string | number }>(params: {
    logsDirectory: string;
    module: string;
    action: string;
    entityName: string;
    entity: TEntity;
    message?: string;
    data?: Record<string, unknown>;
  }): Promise<string> {
    return this.log({
      logsDirectory: params.logsDirectory,
      module: params.module,
      action: params.action,
      entity: params.entityName,
      entityId: params.entity.id,
      message: params.message,
      data: params.data,
    });
  }

  private mountLogger(input: FileLogInput): MountedLogger {
    const now = new Date();
    const day = this.pad(now.getDate());
    const month = this.pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hour = this.pad(now.getHours());
    const minute = this.pad(now.getMinutes());

    const dateFolder = `${day}_${month}_${year}`;
    const moduleName = this.normalize(input.module);
    const actionName = this.normalize(input.action);

    const fileName = `${moduleName}_logger_${dateFolder}_${hour}_${minute}_${actionName}.log`;
    const folderPath = path.join(input.logsDirectory, dateFolder);
    const filePath = path.join(folderPath, fileName);

    return {
      timestamp: now.toISOString(),
      moduleName,
      actionName,
      dateFolder,
      fileName,
      folderPath,
      filePath,
    };
  }

  private buildPayload(input: FileLogInput, mounted: MountedLogger) {
    return {
      timestamp: mounted.timestamp,
      module: mounted.moduleName,
      action: mounted.actionName,
      entity: input.entity ?? null,
      entityId: input.entityId != null ? String(input.entityId) : null,
      message: input.message ?? null,
      data: input.data ?? null,
    };
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }
}