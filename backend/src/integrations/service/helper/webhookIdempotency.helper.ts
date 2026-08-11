import { RedisService } from '@/integrations/redis/service/index.service';

const WEBHOOK_TICKET_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 

export function buildWebhookTicketKey(
  host: string,
  ordemServicoId: number,
): string {
  return `webhook:ticket:${host}:${ordemServicoId}`;
}

export async function claimWebhookTicket(
  redisService: RedisService,
  host: string,
  ordemServicoId: number,
): Promise<boolean> {
  return redisService.setNxEx(
    buildWebhookTicketKey(host, ordemServicoId),
    '1',
    WEBHOOK_TICKET_TTL_SECONDS,
  );
}

export async function releaseWebhookTicket(
  redisService: RedisService,
  host: string,
  ordemServicoId: number,
): Promise<void> {
  await redisService.del(buildWebhookTicketKey(host, ordemServicoId));
}