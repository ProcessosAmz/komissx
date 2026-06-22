import { Module } from '@nestjs/common';
import { CommissionRuleService } from './commission_rule.service';
import { CommissionRuleController } from './commission_rule.controller';

@Module({
  controllers: [CommissionRuleController],
  providers: [CommissionRuleService],
})
export class CommissionRuleModule {}
