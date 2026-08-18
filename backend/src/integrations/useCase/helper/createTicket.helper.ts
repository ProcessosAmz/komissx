import { Logger } from '@nestjs/common';
import { Host } from '@/common/enums/host.enum';
import { getErrorMessage } from '@/utils/error.utils';

export function logTicketIgnorado(
  logger: Logger,
  idClienteServico: number,
  numeroOrdem: string,
  host: Host | null,
): void {
  logger.log(
    `Ticket Ignorado - ${idClienteServico}, ${numeroOrdem} -- Host: ${host ?? 'desconhecido'}`,
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