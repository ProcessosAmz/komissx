import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@/module/auth/controller/index';
import { AuthGuard } from '@/module/auth/guard/auth.guard';
import { AuthService } from '@/module/auth/service/index.service';
import { UsersModule } from '@/module/users/index.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN) ?? 8 * 60 * 60,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}