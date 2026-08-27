import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/module/health/controller/index.controller';
import { RedisHealthIndicator } from '@/module/health/indicator/redis.health.indicator';
import { ShutdownHealthIndicator } from '@/module/health/indicator/shutdown.health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator,
    ShutdownHealthIndicator,
  ],
})
export class HealthModule {}
