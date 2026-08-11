import { Global, Module } from '@nestjs/common';
import { RedisService } from '@/integrations/redis/service/index.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}