import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Logger,
  } from "@nestjs/common";
  import { Reflector } from "@nestjs/core";
  import { ROLES_KEY } from "@/module/auth/const/roles.const";
  import { AuthenticatedUser } from "@/module/auth/types/authenticatedUser.type";
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);
    constructor(private readonly reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
  
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user as AuthenticatedUser | undefined;
      const userRole = user?.role?.trim().toUpperCase();
  
      if (!userRole || !requiredRoles.includes(userRole)) {
        this.logger.error(`User ${user?.id} does not have the required roles: ${requiredRoles.join(', ')}`);
        throw new ForbiddenException(
          "Apenas administradores podem executar esta ação.",
        );
      }
  
      return true;
    }
  }