import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "@/module/auth/controller/index";
import { AuthGuard } from "@/module/auth/guard/auth.guard";
import { RolesGuard } from "@/module/auth/guard/roles.guard";
import { AuthService } from "@/module/auth/service/index.service";
import { UsersModule } from "@/module/users/index.module";

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthGuard, RolesGuard, AuthService],
})
export class AuthModule {}