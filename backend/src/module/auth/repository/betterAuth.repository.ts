import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createLocalAccountIssuer } from "better-auth/db";
import { auth } from "@/module/auth/better-auth";
import { BetterAuthAccount } from "@/module/auth/entities/betterAuthAccount.entity";
import { BetterAuthUser } from "@/module/auth/entities/betterAuthUser.entity";

export type CreateCredentialUserInput = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  passwordHash: string;
};

export type UpdateCredentialUserInput = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

const CREDENTIAL_PROVIDER_ID = "credential";

@Injectable()
export class BetterAuthRepository {
  constructor(
    @InjectRepository(BetterAuthUser)
    private readonly authUserRepository: Repository<BetterAuthUser>,
    @InjectRepository(BetterAuthAccount)
    private readonly authAccountRepository: Repository<BetterAuthAccount>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    if (!auth) {
      throw new Error("Autenticação indisponível");
    }
    const context = await auth.$context;
    return context.password.hash(password);
  }

  async createCredentialUser(
    input: CreateCredentialUserInput,
  ): Promise<void> {
    if (!auth) {
      throw new Error("Autenticação indisponível");
    }

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

  async updateCredentialUser(
    input: UpdateCredentialUserInput,
  ): Promise<void> {
    await this.authUserRepository.update(
      { id: input.id },
      {
        name: input.name,
        email: input.email,
        role: input.role,
        active: input.active,
        updatedAt: new Date(),
      },
    );
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.authAccountRepository.update(
      {
        userId,
        providerId: CREDENTIAL_PROVIDER_ID,
      },
      {
        password: passwordHash,
        updatedAt: new Date(),
      },
    );
  }
}
