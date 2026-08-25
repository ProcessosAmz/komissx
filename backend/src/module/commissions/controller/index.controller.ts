import {
  Controller,
  Get,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ListCommissionRulesUseCase } from "@/module/commissions/useCase";

@ApiTags("commissions")
@Controller("commissions")
export class CommissionsController {
  constructor(
    private readonly listCommissionRulesUseCase: ListCommissionRulesUseCase,
  ) {}

  @Get("rules")
  @ApiOperation({ summary: "List commission catalog values" })
  @ApiResponse({ status: 200, description: "Values listed successfully" })
  findRules() {
    return this.listCommissionRulesUseCase.execute();
  }

}