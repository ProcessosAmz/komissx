import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from '@/module/users/entities/users.entity';
import { CreateUserDto, FilterUsersDto } from '@/module/users/dto';
import { getErrorMessage } from '@/utils/error.utils';
import { UserListItem } from '@/module/users/types/user';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Attempting to create user: ${createUserDto.email}`);

    const isEmailExists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (isEmailExists) {
      this.logger.warn(`Email already registered: ${createUserDto.email}`);
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
        empresaId: createUserDto.empresaId,
        unidadeId: createUserDto.unidadeId,
        supervisorId: createUserDto.supervisorId ?? null,
        participaFechamento: createUserDto.participaFechamento ?? false,
        active: createUserDto.active ?? true,
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

  async findAll(filters: FilterUsersDto) {
    this.logger.log('Listing all users');

    try {
      const queryBuilder = this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.empresa', 'empresa')
        .leftJoinAndSelect('user.unidade', 'unidade')
        .leftJoinAndSelect('unidade.estado', 'estado')
        .where('user.active = :active', { active: true });

      if (filters.empresaId) {
        queryBuilder.andWhere('user.empresa_id = :empresaId', {
          empresaId: filters.empresaId,
        });
      }

      if (filters.unidadeId) {
        queryBuilder.andWhere('user.unidade_id = :unidadeId', {
          unidadeId: filters.unidadeId,
        });
      }

      if (filters.estadoId) {
        queryBuilder.andWhere('unidade.estado_id = :estadoId', {
          estadoId: filters.estadoId,
        });
      }

      if (filters.search?.trim()) {
        queryBuilder.andWhere(
          '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
          { search: `%${filters.search.trim()}%` },
        );
      }

      const users = await queryBuilder.orderBy('user.name', 'ASC').getMany();

      if (users.length === 0) {
        this.logger.warn('No active users found for the given filters');
        return { data: [], message: 'Nenhum usuário encontrado' };
      }

      const mapped: UserListItem[] = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        hubsoftId: user.hubsoftId,
        roleId: user.roleId,
        roleName: user.role?.name ?? '',
        empresaId: user.empresaId,
        empresaName: user.empresa?.name ?? '',
        unidadeId: user.unidadeId,
        unidadeName: user.unidade?.name ?? '',
        estadoId: user.unidade?.estadoId ?? null,
        estadoName: user.unidade?.estado?.name ?? null,
        supervisorId: user.supervisorId,
        participaFechamento: user.participaFechamento,
        active: user.active,
      }));

      this.logger.log('Users listed successfully');
      return {
        data: this.buildTree(mapped),
        message: 'Usuários listados com sucesso',
      };
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(`Failed to list users: ${message}`, (error as Error)?.stack);
      throw new InternalServerErrorException('Erro ao listar usuários');
    }
  }

  private buildTree(users: UserListItem[]): UserListItem[] {
    const usersById = new Map<string, UserListItem>();

    users.forEach((user) => {
      usersById.set(user.id, { ...user, children: [] });
    });

    const roots: UserListItem[] = [];

    usersById.forEach((user) => {
      if (user.supervisorId && usersById.has(user.supervisorId)) {
        usersById.get(user.supervisorId)!.children!.push(user);
        return;
      }
      roots.push(user);
    });

    return roots;
  }

  async findByEmail(email: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }
}