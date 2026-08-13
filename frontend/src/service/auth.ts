import { isAxiosError } from "axios";
import { AUTH_PATH } from "@/const/auth";
import { HTTP_STATUS } from "@/const/httpStatus";
import { API } from "@/lib/axios";
import type { AuthenticatedUser, LoginCredentials } from "@/types/auth";
import { toAuthenticationError } from "@/utils/toAuthenticationError";
import { sessionResponseSchema } from "@/utils/validators/auth";

export class AuthService {
  private static readonly path = AUTH_PATH;

  static async login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
    try {
      const response = await API.post(`${this.path}/login`, credentials);
      return sessionResponseSchema.parse(response.data).data;
    } catch (error) {
      throw toAuthenticationError(error);
    }
  }

  static async logout(): Promise<void> {
    try {
      await API.post(`${this.path}/logout`);
    } catch (error) {
      throw toAuthenticationError(error);
    }
  }

  static async me(): Promise<AuthenticatedUser | null> {
    try {
      const response = await API.get(`${this.path}/user`);
      return sessionResponseSchema.parse(response.data).data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
        return null;
      }

      throw toAuthenticationError(error);
    }
  }
}