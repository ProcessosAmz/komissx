import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ data: { name: string, email: string }; message: string }> {
    const isEmailExists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (isEmailExists) {
      this.logger.error('Email já cadastrado', { email: createUserDto.email });
      throw new ConflictException('Email já cadastrado');
    }

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.usersRepository.save({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        hubsoftId: createUserDto.hubsoftId ?? null,
        roleId: createUserDto.roleId,
        operadoraId: createUserDto.operadoraId,
        regionalId: createUserDto.regionalId,
        supervisorId: createUserDto.supervisorId ?? null,
        participaFechamento: createUserDto.participaFechamento ?? false,
        active: createUserDto.active ?? true,
      });


      this.logger.log('Usuário criado com sucesso', { user: user.name });
      return {
        data: {
          name: user.name,
          email: user.email,
        },
        message: 'Usuário criado com sucesso',
      };
    } catch {
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }
}