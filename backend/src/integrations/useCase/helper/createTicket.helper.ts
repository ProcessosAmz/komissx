import { Logger } from '@nestjs/common';
import { Host } from '@/common/enums/host.enum';
import { getErrorMessage } from '@/utils/error.utils';

export function logTicketIgnorado(
  logger: Logger,
  idClienteServico: number | undefined,
  numeroOrdem: string | undefined,
  host: Host | null,
  motivo: string,
): void {
  logger.log(
    `Ticket ignorado — ${motivo} — cliente ${idClienteServico ?? 'n/a'}, OS ${numeroOrdem ?? 'n/a'} (${host ?? 'desconhecido'})`,
  );
}

export function logAndRethrow(
  logger: Logger,
  context: string,
  error: unknown,
): never {
  const message = getErrorMessage(error);
  logger.error(
    `${context}: ${message}`,
    error instanceof Error ? error.stack : undefined,
  );
  throw error;
}