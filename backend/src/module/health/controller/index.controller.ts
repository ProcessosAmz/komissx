import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
} from "@nestjs/terminus";
import { Public } from "@/module/auth/decorator/public.decorator";
import { RedisHealthIndicator } from "@/module/health/indicator/redis.health.indicator";
import { ShutdownHealthIndicator } from "@/module/health/indicator/shutdown.health.indicator";

@Controller("health")
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly redisHealthIndicator: RedisHealthIndicator,
    private readonly shutdownHealthIndicator: ShutdownHealthIndicator,
  ) {}

  @Public()
  @Get("live")
  live() {
    return { status: "ok" };
  }

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.shutdownHealthIndicator.isAcceptingTraffic("shutdown"),
      () => this.redisHealthIndicator.ping("redis"),
    ]);
  }
}
