import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommissionsController } from "@/module/commissions/controller/index.controller";
import { CommissionRule } from "@/module/commissions/entities/comissionRule.entity";
import { CommissionRulesRepository } from "@/module/commissions/repository/index.repository";
import {
  CreateCommissionRuleUseCase,
  DeleteCommissionRuleUseCase,
  ListCommissionRulesUseCase,
  UpdateCommissionRuleUseCase,
} from "@/module/commissions/useCase";

@Module({
  imports: [TypeOrmModule.forFeature([CommissionRule])],
  controllers: [CommissionsController],
  providers: [
    CommissionRulesRepository,
    ListCommissionRulesUseCase,
    CreateCommissionRuleUseCase,
    UpdateCommissionRuleUseCase,
    DeleteCommissionRuleUseCase,
  ],
})
export class CommissionsModule {}