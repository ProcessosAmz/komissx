import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "@/module/auth/decorator/currentUser.decorator";
import { Roles } from "@/module/auth/decorator/roles.decorator";
import { ADMIN_ROLE } from "@/module/auth/const/roles.const";
import { AuthenticatedUser } from "@/module/auth/types/authenticatedUser.type";
import { CreateUserDto, FilterUsersDto, UpdateUserDto } from "@/module/users/dto";
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  ListUsersUseCase,
  UpdateUserUseCase,
} from "@/module/users/useCase";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: "List users as hierarchy tree" })
  @ApiResponse({ status: 200, description: "Users listed successfully" })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  findAll(@Query() filters: FilterUsersDto) {
    return this.listUsersUseCase.execute(filters);
  }

  @Post()
  @Roles(ADMIN_ROLE)
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({
    type: CreateUserDto,
    description: "User data",
    examples: {
      default: {
        value: {
          name: "Jessica Martins",
          email: "jessica@amazonet.com",
          password: "senha123",
          hubsoftId: 12345,
          roleId: "123e4567-e89b-12d3-a456-426614174000",
          empresaId: "123e4567-e89b-12d3-a456-426614174000",
          unidadeId: "123e4567-e89b-12d3-a456-426614174000",
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  @ApiResponse({ status: 409, description: "Email already registered" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Patch(":id")
  @Roles(ADMIN_ROLE)
  @ApiOperation({ summary: "Update an existing user" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid user data" })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 409, description: "Email already registered" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  update(
    @Param("id", ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute(userId, updateUserDto);
  }

  @Delete(":id")
  @Roles(ADMIN_ROLE)
  @ApiOperation({ summary: "Deactivate an existing user" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid user data" })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  @ApiResponse({ status: 403, description: "Sem permissão" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  delete(
    @Param("id", ParseUUIDPipe) userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.deleteUserUseCase.execute(userId, currentUser.id);
  }
}