import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthenticatedUser } from "@/module/auth/types/authenticatedUser.type";
import { Users } from "@/module/users/entities/users.entity";
import { UsersRepository } from "@/module/users/repository/index.repository";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async getSessionUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.usersRepository.findByIdWithRole(userId);

    if (!user) {
      throw new UnauthorizedException("Sessão inválida");
    }

    if (!user.active) {
      this.logger.warn(`Session rejected: inactive user (${user.email})`);
      throw new ForbiddenException("Usuário inativo");
    }

    return this.toAuthenticatedUser(user);
  }

  private toAuthenticatedUser(user: Users): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role?.name ?? "").trim().toUpperCase(),
      active: user.active,
    };
  }
}