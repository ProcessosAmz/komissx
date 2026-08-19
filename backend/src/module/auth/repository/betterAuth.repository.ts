import { Injectable } from "@nestjs/common";
import { createLocalAccountIssuer } from "better-auth/db";
import { auth } from "@/module/auth/better-auth";

export type CreateCredentialUserInput = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  passwordHash: string;
};

const CREDENTIAL_PROVIDER_ID = "credential";

@Injectable()
export class BetterAuthRepository {
  async hashPassword(password: string): Promise<string> {
    const context = await auth.$context;
    return context.password.hash(password);
  }

  async createCredentialUser(
    input: CreateCredentialUserInput,
  ): Promise<void> {
    const context = await auth.$context;

    await context.internalAdapter.createUser(
      {
        id: input.id,
        name: input.name,
        email: input.email,
        emailVerified: true,
        role: input.role,
        active: input.active,
      },
      { method: "email-password" },
    );

    await context.internalAdapter.linkAccount({
      userId: input.id,
      accountId: input.id,
      providerId: CREDENTIAL_PROVIDER_ID,
      issuer: createLocalAccountIssuer(CREDENTIAL_PROVIDER_ID),
      password: input.passwordHash,
    });
  }
}