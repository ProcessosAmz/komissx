import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/module/auth/decorator/roles.decorator";
import { AuthenticatedUser } from "@/module/auth/types/authenticatedUser.type";
import {
  CreateFinancialCloseDto,
  CreateManualFinancialItemDto,
  ReviewFinancialItemDto,
} from "@/module/financial-closes/dto/financial-close.dto";
import { FinancialClosesService } from "@/module/financial-closes/financial-closes.service";
import { ImportFinancialSourceDto } from "@/module/financial-closes/dto/import-financial-source.dto";

@ApiTags("financial-closes")
@Roles("ADMIN")
@Controller("financial-closes")
export class FinancialClosesController {
  constructor(private readonly service: FinancialClosesService) {}

  @Get()
  @ApiOperation({ summary: "Listar fechamentos financeiros de Retirada e Vendas Autônomos" })
  list(@Query("modality") modality?: string) {
    return this.service.list(modality);
  }

  @Post()
  @ApiOperation({ summary: "Criar fechamento financeiro" })
  create(@Body() dto: CreateFinancialCloseDto, @Req() req: { user: AuthenticatedUser }) {
    return this.service.create(dto, req.user);
  }

  @Get(":closeId/sources")
  @ApiOperation({ summary: "Consultar histórico de importações de fontes" })
  sourceRuns(@Param("closeId", ParseUUIDPipe) closeId: string) {
    return this.service.sourceRuns(closeId);
  }

  @Post(":closeId/sources/:sourceName/test")
  @ApiOperation({ summary: "Testar conexão de leitura com uma fonte, sem importar registros" })
  testSourceConnection(@Param("closeId", ParseUUIDPipe) closeId: string, @Param("sourceName") sourceName: string, @Req() req: { user: AuthenticatedUser }) {
    return this.service.testSourceConnection(closeId, sourceName, req.user);
  }

  @Get(":closeId/sources/readiness")
  @ApiOperation({ summary: "Verificar configuração das fontes necessárias para o fechamento" })
  sourceReadiness(@Param("closeId", ParseUUIDPipe) closeId: string) {
    return this.service.sourceReadiness(closeId);
  }

  @Post(":closeId/sources/import")
  @ApiOperation({ summary: "Importar registros normalizados de uma fonte, mantendo novos itens bloqueados para validação" })
  importSource(@Param("closeId", ParseUUIDPipe) closeId: string, @Body() dto: ImportFinancialSourceDto, @Req() req: { user: AuthenticatedUser }) {
    return this.service.importSource(closeId, dto, req.user);
  }

  @Post(":closeId/items/manual")
  @ApiOperation({ summary: "Incluir item manual bloqueado para conferência" })
  addManualItem(@Param("closeId", ParseUUIDPipe) closeId: string, @Body() dto: CreateManualFinancialItemDto, @Req() req: { user: AuthenticatedUser }) {
    return this.service.addManualItem(closeId, dto, req.user);
  }

  @Post("items/:itemId/review")
  @ApiOperation({ summary: "Revisar item individual com justificativa e auditoria" })
  reviewItem(@Param("itemId", ParseUUIDPipe) itemId: string, @Body() dto: ReviewFinancialItemDto, @Req() req: { user: AuthenticatedUser }) {
    return this.service.reviewItem(itemId, dto, req.user);
  }
}
