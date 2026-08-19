import { Module } from "@nestjs/common";
import { AuthController } from "@/module/auth/controller/index";
import { AuthGuard } from "@/module/auth/guard/auth.guard";
import { AuthService } from "@/module/auth/service/index.service";
import { UsersModule } from "@/module/users/index.module";

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}