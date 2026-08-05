import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../service/index.service';
import { CreateUserDto, FilterUsersDto } from '../dto';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuários com filtros' })
  @ApiResponse({ status: 200, description: 'Usuários listados com sucesso' })
  findAll(@Query() filters: FilterUsersDto) {
    return this.usersService.findAll(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'User data',
    examples: {
      default: {
        value: {
          name: 'Jessica Martins',
          email: 'jessica@amazonet.com',
          password: 'senha123',
          hubsoftId: 12345,
          roleId: '123e4567-e89b-12d3-a456-426614174000',
          empresaId: '123e4567-e89b-12d3-a456-426614174000',
          unidadeId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.log('Received request to create a new user');
      return await this.usersService.create(createUserDto);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(error);
        throw new BadRequestException(error.message);
      }
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Erro ao criar usuário, tente novamente mais tarde',
      );
    }
  }
}