import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/module/auth/decorator/roles.decorator";
import { ADMIN_ROLE } from "@/module/auth/const/roles.const";
import { CreateCommissionRuleDto } from "@/module/commissions/dto/createCommissionRule.dto";
import { UpdateCommissionRuleDto } from "@/module/commissions/dto/updateCommissionRule.dto";
import {
  CreateCommissionRuleUseCase,
  DeleteCommissionRuleUseCase,
  ListCommissionRulesUseCase,
  UpdateCommissionRuleUseCase,
} from "@/module/commissions/useCase";

@ApiTags("commissions")
@Controller("commissions")
export class CommissionsController {
  constructor(
    private readonly listCommissionRulesUseCase: ListCommissionRulesUseCase,
    private readonly createCommissionRuleUseCase: CreateCommissionRuleUseCase,
    private readonly updateCommissionRuleUseCase: UpdateCommissionRuleUseCase,
    private readonly deleteCommissionRuleUseCase: DeleteCommissionRuleUseCase,
  ) {}

  @Get("rules")
  @ApiOperation({ summary: "List commission catalog values" })
  findRules() {
    return this.listCommissionRulesUseCase.execute();
  }

  @Post("rules")
  @Roles(ADMIN_ROLE)
  @ApiOperation({ summary: "Create commission catalog value" })
  @ApiResponse({ status: 201, description: "Value created successfully" })
  createRule(@Body() body: CreateCommissionRuleDto) {
    return this.createCommissionRuleUseCase.execute(body);
  }

  @Patch("rules/:id")
  @Roles(ADMIN_ROLE)
  @ApiOperation({ summary: "Update commission catalog value" })
  updateRule(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateCommissionRuleDto,
  ) {
    return this.updateCommissionRuleUseCase.execute(id, body);
  }

  @Delete("rules/:id")
  @Roles(ADMIN_ROLE)
  @ApiOperation({ summary: "Deactivate commission catalog value" })
  deleteRule(@Param("id", ParseIntPipe) id: number) {
    return this.deleteCommissionRuleUseCase.execute(id);
  }
}