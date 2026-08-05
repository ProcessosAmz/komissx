import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresas } from '../entities/empresas.entity';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresas)
    private readonly empresasRepository: Repository<Empresas>,
  ) {}

  async findAll() {
    const empresas = await this.empresasRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
      select: ['id', 'name'],
    });

    if (empresas.length === 0) {
      return { data: [], message: 'Nenhuma empresa encontrada' };
    }

    return {
      data: empresas,
      message: 'Empresas listadas com sucesso',
    };
  }
}