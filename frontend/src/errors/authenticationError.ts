import type { AuthErrorCode } from "@/types/auth";
import { AppError } from "@/errors/appError";

export class AuthenticationError extends AppError<AuthErrorCode> {
  constructor(code: AuthErrorCode, message: string) {
    super(code, message);
    this.name = "AuthenticationError";
  }
}