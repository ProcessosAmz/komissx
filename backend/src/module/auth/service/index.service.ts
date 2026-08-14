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
import { UsersService } from '@/module/users/service/index.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async login(dto: LoginDto): Promise<{
        user: AuthenticatedUser;
        token: string;
    }> {
        const user = await this.usersService.findByEmail(dto.email);

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

        const sessionUser = this.toAuthenticatedUser(user);
        const token = await this.jwtService.signAsync({
            sub: user.id,
        } as JwtPayload);

        this.logger.log(`User authenticated: ${user.email}`);

        return { user: sessionUser, token };
    }

    async getSessionUser(userId: string): Promise<AuthenticatedUser> {
        const user = await this.usersService.findById(userId);

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
            telas_fechamento: [],
        };
    }
}