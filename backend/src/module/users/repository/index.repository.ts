import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '@/module/users/entities/users.entity';
import { CreateUserDto } from '@/module/users/dto/createUser.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly ormRepository: Repository<Users>,
  ) {}

  async create(data: CreateUserDto): Promise<Users> {
    return await this.ormRepository.save(this.ormRepository.create(data));
  }

  async findByEmail(email: string): Promise<Users | null> {
    return await this.ormRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<Users | null> {
    return await this.ormRepository.findOne({
      where: { id },
    });
  }

  async findByIdWithRole(id: string): Promise<Users | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }
}