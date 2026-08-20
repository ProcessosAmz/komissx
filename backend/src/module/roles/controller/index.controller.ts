import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterRolesDto } from "@/module/roles/dto/filterRoles.dto";
import { FilterRolesUseCase } from "@/module/roles/useCase";

@ApiTags("roles")
@Controller("roles")
export class RolesController {
  constructor(private readonly filterRolesUseCase: FilterRolesUseCase) {}

  @Get()
  @ApiOperation({ summary: "Listar cargos" })
  @ApiResponse({ status: 200, description: "Cargos listados com sucesso" })
  @ApiResponse({ status: 401, description: "Sessão inválida" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  findAll(@Query() input: FilterRolesDto) {
    return this.filterRolesUseCase.execute(input);
  }
}