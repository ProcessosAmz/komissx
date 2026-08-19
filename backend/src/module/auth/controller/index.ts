import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/module/auth/decorator/currentUser.decorator";
import { AuthGuard } from "@/module/auth/guard/auth.guard";
import { AuthenticatedUser } from "@/module/auth/types/authenticatedUser.type";

@ApiTags("auth")
@Controller("me")
export class AuthController {
  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Obter usuário da sessão" })
  @ApiResponse({ status: 200, description: "Sessão válida" })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  me(@CurrentUser() user: AuthenticatedUser) {
    return { data: user };
  }
}