import { Injectable } from '@nestjs/common';
import { MetaService } from '../../../integrations/service/metabase.service';
import { RelatorioTecnicoDto } from '../dto/relatorioTecnicoInstalacao.dto';

@Injectable()
export class ReportService {
  constructor(private readonly metaService: MetaService) {}

  buscarInstalacaoTecnica(dto: RelatorioTecnicoDto) {
    return this.metaService.vendasTecnico(dto);
  }
}