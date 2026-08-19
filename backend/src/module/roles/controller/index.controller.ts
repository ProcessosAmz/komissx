import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RolesService } from "@/module/roles/service/index.service";

@ApiTags("roles")
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: "Listar cargos" })
  @ApiResponse({ status: 200, description: "Cargos listados com sucesso" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  findAll() {
    return this.rolesService.findAll();
  }
}