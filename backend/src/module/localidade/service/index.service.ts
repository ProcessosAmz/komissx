import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from '@/module/localidade/entities/estado.entity';
import { getErrorMessage } from '@/utils/error.utils';

@Injectable()
export class LocalidadeService {
  private readonly logger = new Logger(LocalidadeService.name);

  constructor(
    @InjectRepository(Estado)
    private readonly estadoRepository: Repository<Estado>,
  ) { }

  async findAllEstados() {
    this.logger.log('Listing all states');
    try {
      const estados = await this.estadoRepository.find({
        where: { active: true },
        order: { name: 'ASC' },
        select: ['id', 'name', 'uf'],
      });

      if (estados.length === 0) {
        this.logger.warn('No active states found');
        return { data: [], message: 'Nenhum estado encontrado' };
      }

      this.logger.log('States listed successfully');
      return {
        data: estados,
        message: 'Estados listados com sucesso',
      };
    } catch (error) {
      const message = getErrorMessage(error);

      this.logger.error(`Failed to list states: ${message}`, (error as Error)?.stack);

      throw new InternalServerErrorException('Erro ao listar estados');
    }

  }
}