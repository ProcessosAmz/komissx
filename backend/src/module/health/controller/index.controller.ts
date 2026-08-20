import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { Public } from "@/module/auth/decorator/public.decorator";
import { RedisHealthIndicator } from "@/module/health/indicator/redis.health.indicator";
import { ShutdownHealthIndicator } from "@/module/health/indicator/shutdown.health.indicator";

@Controller("health")
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly redisHealthIndicator: RedisHealthIndicator,
    private readonly shutdownHealthIndicator: ShutdownHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.shutdownHealthIndicator.isAcceptingTraffic("shutdown"),
      () => this.typeOrmHealthIndicator.pingCheck("database"),
      () => this.redisHealthIndicator.ping("redis"),
    ]);
  }
}