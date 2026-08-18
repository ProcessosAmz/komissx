import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class ShutdownHealthIndicator
  extends HealthIndicator
  implements BeforeApplicationShutdown
{
  private acceptingTraffic = true;

  beforeApplicationShutdown(): void {
    this.acceptingTraffic = false;
  }

  isAcceptingTraffic(key: string): HealthIndicatorResult {
    return this.getStatus(key, this.acceptingTraffic);
  }
}