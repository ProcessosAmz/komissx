import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@/module/auth/dto/login.dto';
import { AuthenticatedUser } from '@/module/auth/types/authenticatedUser.type';
import { JwtPayload } from '@/module/auth/types/jwtPayload';
import { Users } from '@/module/users/entities/users.entity';
import { UsersRepository } from '@/module/users/repository/index.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) { }

  async login(dto: LoginDto): Promise<{
    user: AuthenticatedUser;
    token: string;
  }> {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      this.logger.warn(`Login failed: email not found (${dto.email})`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password (${dto.email})`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.active) {
      this.logger.warn(`Login failed: inactive user (${dto.email})`);
      throw new ForbiddenException('Usuário inativo');
    }

    const userWithRole = await this.usersRepository.findByIdWithRole(user.id);

    if (!userWithRole) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const sessionUser = this.toAuthenticatedUser(userWithRole);

    const payload: JwtPayload = {
      sub: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
    };

    const token = await this.jwtService.signAsync(payload);

    this.logger.log(`User authenticated: ${user.email}`);

    return { user: sessionUser, token };
  }

  async getSessionUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.usersRepository.findByIdWithRole(userId);

    if (!user) {
      throw new UnauthorizedException('Sessão inválida');
    }

    if (!user.active) {
      throw new ForbiddenException('Usuário inativo');
    }

    return this.toAuthenticatedUser(user);
  }

  private toAuthenticatedUser(user: Users): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role?.name ?? '').trim().toUpperCase(),
      active: user.active,
    };
  }
}