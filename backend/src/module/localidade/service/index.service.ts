import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from '../entities/estado.entity';

@Injectable()
export class LocalidadeService {
  constructor(
    @InjectRepository(Estado)
    private readonly estadoRepository: Repository<Estado>,
  ) {}

  async findAllEstados() {
    const estados = await this.estadoRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
      select: ['id', 'name', 'uf'],
    });

    if (estados.length === 0) {
      return { data: [], message: 'Nenhum estado encontrado' };
    }

    return {
      data: estados,
      message: 'Estados listados com sucesso',
    };
  }
}