import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresas } from '@/module/empresas/entities/empresas.entity';
import { getErrorMessage } from '@/utils/error.utils';

@Injectable()
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(
    @InjectRepository(Empresas)
    private readonly empresasRepository: Repository<Empresas>,
  ) {}

  async findAll() {
    this.logger.log('Listing all companies');

    try {
      const empresas = await this.empresasRepository.find({
        where: { active: true },
        order: { name: 'ASC' },
        select: ['id', 'name'],
      });

      if (empresas.length === 0) {
        this.logger.warn('No active companies found');
        return { data: [], message: 'Nenhuma empresa encontrada' };
      }

      this.logger.log('Companies listed successfully');
      return {
        data: empresas,
        message: 'Empresas listadas com sucesso',
      };
    } catch (error) {
      const message = getErrorMessage(error);

      this.logger.error(`Failed to list companies: ${message}`, (error as Error)?.stack);

      throw new InternalServerErrorException('Erro ao listar empresas');
    }
  }
}