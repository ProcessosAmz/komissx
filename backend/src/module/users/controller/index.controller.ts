import { Controller, Post, Body } from "@nestjs/common";
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "@/module/users/dto";
import { CreateUserUseCase } from "@/module/users/useCase";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
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
  @ApiResponse({ status: 409, description: "Email already registered" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }
}