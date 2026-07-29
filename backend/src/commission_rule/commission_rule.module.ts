import { Module } from "@nestjs/common";
import { CommissionRuleController } from "./commission_rule.controller";
import { CommissionRuleService } from "./commission_rule.service";

@Module({
  controllers: [CommissionRuleController],
  providers: [CommissionRuleService],
})
export class CommissionRuleModule {}
