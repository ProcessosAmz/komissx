import { Global, Module } from '@nestjs/common';
import { FileLoggerService } from '@/module/logger/service/fileLogger.service';

@Global()
@Module({
  providers: [FileLoggerService],
  exports: [FileLoggerService],
})
export class LoggerModule {}