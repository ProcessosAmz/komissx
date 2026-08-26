import { Host } from "@/common/enums/host.enum";
import { hubsoftConsole } from "@/integrations/logger/hubsoftConsole.logger";
import { getErrorMessage } from "@/utils/error.utils";
import { Logger } from "@nestjs/common";

export function logTicketIgnorado(
  idClienteServico: number | undefined,
  numeroOrdem: string | undefined,
  host: Host,
  motivo: string,
): void {
  hubsoftConsole.skip(
    host,
    "create",
    `ignorado — ${motivo} — cliente ${idClienteServico ?? "n/a"} | OS ${numeroOrdem ?? "n/a"}`,
  );
}

export function logAndRethrow(
  logger: Logger,
  context: string,
  error: unknown,
  host?: Host,
): never {
  const message = getErrorMessage(error);

  if (host) {
    hubsoftConsole.error(host, "create", `${context}: ${message}`);
  } else {
    logger.error(
      `${context}: ${message}`,
      error instanceof Error ? error.stack : undefined,
    );
  }

  throw error;
}
