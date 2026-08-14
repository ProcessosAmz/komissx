import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES } from "@/const/auth";
import { HTTP_STATUS } from "@/const/httpStatus";
import { AuthenticationError } from "@/errors/authenticationError";
import type { AuthErrorCode } from "@/types/auth";
import { createToError, type ErrorMapper } from "@/utils/toAppError";

const AUTH_ERROR_MAPPER: ErrorMapper<AuthErrorCode> = {
  validation: {
    code: AUTH_ERROR_CODES.UNSUPPORTED_ROLE,
    message: AUTH_ERROR_MESSAGES.UNSUPPORTED_ROLE,
  },
  network: {
    code: AUTH_ERROR_CODES.NETWORK_UNAVAILABLE,
    message: AUTH_ERROR_MESSAGES.NETWORK_UNAVAILABLE,
  },
  unexpected: {
    code: AUTH_ERROR_CODES.UNEXPECTED,
    message: AUTH_ERROR_MESSAGES.UNEXPECTED,
  },
  status: {
    [HTTP_STATUS.UNAUTHORIZED]: {
      code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
    },
    [HTTP_STATUS.FORBIDDEN]: {
      code: AUTH_ERROR_CODES.INACTIVE_USER,
      message: AUTH_ERROR_MESSAGES.INACTIVE_USER,
    },
  },
};

export const toAuthenticationError = createToError(
  AUTH_ERROR_MAPPER,
  AuthenticationError,
);