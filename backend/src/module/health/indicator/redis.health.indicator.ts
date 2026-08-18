import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '@/integrations/redis/service/index.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async ping(key: string): Promise<HealthIndicatorResult> {
    try {
      const response = await this.redisService.ping();
      return this.getStatus(key, response === 'PONG');
    } catch {
      return this.getStatus(key, false);
    }
  }
}