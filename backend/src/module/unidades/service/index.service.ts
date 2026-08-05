import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unidades } from '../entities/unidades.entity';
import { FilterUnidadesDto } from '../dto/filterUnidade.dto';

@Injectable()
export class UnidadesService {
  constructor(
    @InjectRepository(Unidades)
    private readonly unidadesRepository: Repository<Unidades>,
  ) {}

  async findAll(filters: FilterUnidadesDto) {
    const queryBuilder = this.unidadesRepository
      .createQueryBuilder('unidade')
      .select([
        'unidade.id',
        'unidade.name',
        'unidade.empresaId',
        'unidade.estadoId',
      ])
      .where('unidade.active = :active', { active: true });

    if (filters.empresaId) {
      queryBuilder.andWhere('unidade.empresa_id = :empresaId', {
        empresaId: filters.empresaId,
      });
    }

    if (filters.estadoId) {
      queryBuilder.andWhere('unidade.estado_id = :estadoId', {
        estadoId: filters.estadoId,
      });
    }

    const unidades = await queryBuilder
      .orderBy('unidade.name', 'ASC')
      .getMany();

    if (unidades.length === 0) {
      return { data: [], message: 'Nenhuma unidade encontrada' };
    }

    return {
      data: unidades,
      message: 'Unidades listadas com sucesso',
    };
  }
}