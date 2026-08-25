import { HttpException, InternalServerErrorException, Logger } from "@nestjs/common";

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro desconhecido';
}

export function rethrowOrInternalError(
    error: unknown,
    logger: Logger,
    context: string,
    fallbackMessage: string,
  ): never {
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error(
      `${context}: ${getErrorMessage(error)}`,
      (error as Error)?.stack,
    );
    throw new InternalServerErrorException(fallbackMessage);
  }