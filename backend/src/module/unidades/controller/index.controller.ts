import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UnidadesService } from '../service/index.service';
import { FilterUnidadesDto } from '../dto/filterUnidade.dto';

@ApiTags('unidades')
@Controller('unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar unidades ativas para filtros' })
  @ApiResponse({ status: 200, description: 'Unidades listadas com sucesso' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findAll(@Query() filters: FilterUnidadesDto) {
    return this.unidadesService.findAll(filters);
  }
}