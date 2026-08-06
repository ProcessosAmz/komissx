import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalidadeService } from '../service/index.service';

@ApiTags('localidade')
@Controller('estados')
export class LocalidadeController {
  constructor(private readonly localidadeService: LocalidadeService) {}

  @Get()
  @ApiOperation({ summary: 'Listar estados ativos para filtros' })
  @ApiResponse({ status: 200, description: 'Estados listados com sucesso' })
  findAllEstados() {
    return this.localidadeService.findAllEstados();
  }
}