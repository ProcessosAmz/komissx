import { Controller, Post, Body, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../service/index.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto, description: 'User data', examples: {
      default: {
        value: {
          name: 'Jessica Martins',
          email: 'jessica@amazonet.com',
          password: 'senha123',
          roleId: 1,
          operadoraId: 1,
          regionalId: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.log('Received request to create a new user',);
      const result = await this.usersService.create(createUserDto);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(error);
        throw new BadRequestException(error.message);
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Erro ao criar usuário, tente novamente mais tarde');
    }
  }
}
