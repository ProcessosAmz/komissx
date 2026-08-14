import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { AuthService } from '@/module/auth/service/index.service';
  import { JwtPayload } from '@/module/auth/types/jwtPayload';
import { AUTH_COOKIE_NAME } from '@/module/auth/const/authCookieName.const';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly authService: AuthService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = request.cookies?.[AUTH_COOKIE_NAME];
  
      if (!token || typeof token !== 'string') {
        throw new UnauthorizedException('Sessão não encontrada');
      }
  
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        request.user = await this.authService.getSessionUser(payload.sub);
        return true;
      } catch {
        throw new UnauthorizedException('Sessão inválida');
      }
    }
  }