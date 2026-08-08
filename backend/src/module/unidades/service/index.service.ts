import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unidades } from '@/module/unidades/entities/unidades.entity';
import { FilterUnidadesDto } from '@/module/unidades/dto/filterUnidade.dto';
import { getErrorMessage } from '@/utils/error.utils';

@Injectable()
export class UnidadesService {
  private readonly logger = new Logger(UnidadesService.name);

  constructor(
    @InjectRepository(Unidades)
    private readonly unidadesRepository: Repository<Unidades>,
  ) {}

  async findAll(filters: FilterUnidadesDto) {
    this.logger.log('Listing all units');

    try {
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
        this.logger.warn('No active units found for the given filters');
        return { data: [], message: 'Nenhuma unidade encontrada' };
      }

      this.logger.log('Units listed successfully');
      return {
        data: unidades,
        message: 'Unidades listadas com sucesso',
      };
    } catch (error) {
      const message = getErrorMessage(error);

      this.logger.error(`Failed to list units: ${message}`, (error as Error)?.stack);

      throw new InternalServerErrorException('Erro ao listar unidades');
    }
  }
}