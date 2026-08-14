import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from '@/module/users/entities/users.entity';
import { CreateUserDto } from '@/module/users/dto';
import { getErrorMessage } from '@/utils/error.utils';
import { UsersRepository } from '../repository/index.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(body: CreateUserDto) {
    this.logger.log(`Attempting to create user: ${body.email}`);

    const isEmailExists = await this.usersRepository.findByEmail(body.email);

    if (isEmailExists) {
      this.logger.warn(`Email already registered: ${body.email}`);
      throw new ConflictException('Email já cadastrado');
    }

    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const user = await this.usersRepository.create({
        ...body,
        password: hashedPassword,
      });

      this.logger.log(`User created successfully: ${user.email}`);
      return {
        data: {
          name: user.name,
          email: user.email,
        },
        message: 'Usuário criado com sucesso',
      };
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(`Failed to create user: ${message}`, (error as Error)?.stack);
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }
}