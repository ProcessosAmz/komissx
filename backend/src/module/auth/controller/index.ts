import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
    AUTH_COOKIE_NAME,
} from '@/module/auth/const/authCookieName.const';
import { CurrentUser } from '@/module/auth/decorator/currentUser.decorator';
import { LoginDto } from '@/module/auth/dto/login.dto';
import { AuthGuard } from '@/module/auth/guard/auth.guard';
import { AuthService } from '@/module/auth/service/index.service';
import { AuthenticatedUser } from '@/module/auth/types/authenticatedUser.type';
import { getAuthCookieOptions, getClearAuthCookieOptions } from '@/module/auth/auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Autenticar com e-mail e senha' })
    @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    @ApiResponse({ status: 403, description: 'Usuário inativo' })
            async login(
                @Body() dto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const { user, token } = await this.authService.login(dto);

        response.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

        return { data: user };
    }

    @Post('logout')
    @ApiOperation({ summary: 'Encerrar sessão' })
    @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
    logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());

        return { data: null };
    }

    @Get('user')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Obter usuário da sessão' })
    @ApiResponse({ status: 200, description: 'Sessão válida' })
    @ApiResponse({ status: 401, description: 'Sessão inválida' })
    me(@CurrentUser() user: AuthenticatedUser) {
        return { data: user };
    }
}