import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmpresasService } from '../service/index.service';

@ApiTags('empresas')
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empresas ativas para filtros' })
  @ApiResponse({ status: 200, description: 'Empresas listadas com sucesso' })
  findAll() {
    return this.empresasService.findAll();
  }
}