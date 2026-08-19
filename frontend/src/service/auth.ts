import { isAxiosError } from "axios";
import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES } from "@/const/auth";
import { HTTP_STATUS } from "@/const/httpStatus";
import { AuthenticationError } from "@/errors/authenticationError";
import { authClient } from "@/lib/authClient";
import { API } from "@/lib/axios";
import type { AuthenticatedUser, LoginCredentials } from "@/types/auth";
import { toAuthenticationError } from "@/utils/toAuthenticationError";
import { sessionResponseSchema } from "@/utils/validators/auth";

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
    const { error } = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      if (error.status === HTTP_STATUS.FORBIDDEN) {
        throw new AuthenticationError(
          AUTH_ERROR_CODES.INACTIVE_USER,
          AUTH_ERROR_MESSAGES.INACTIVE_USER,
        );
      }

      throw new AuthenticationError(
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    const authenticatedUser = await AuthService.me();

    if (!authenticatedUser) {
      throw new AuthenticationError(
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    return authenticatedUser;
  }

  static async logout(): Promise<void> {
    try {
      await authClient.signOut();
    } catch (error) {
      throw toAuthenticationError(error);
    }
  }

  static async me(): Promise<AuthenticatedUser | null> {
    try {
      const response = await API.get("/me");
      return sessionResponseSchema.parse(response.data).data;
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response?.status === HTTP_STATUS.UNAUTHORIZED
      ) {
        return null;
      }

      throw toAuthenticationError(error);
    }
  }
}