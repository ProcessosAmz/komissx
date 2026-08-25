import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommissionsController } from "@/module/commissions/controller/index.controller";
import { CommissionRule } from "@/module/commissions/entities/comissionRule.entity";
import { CommissionRulesRepository } from "@/module/commissions/repository/index.repository";
import { ListCommissionRulesUseCase } from "@/module/commissions/useCase";

@Module({
  imports: [TypeOrmModule.forFeature([CommissionRule])],
  controllers: [CommissionsController],
  providers: [CommissionRulesRepository, ListCommissionRulesUseCase],
})
export class CommissionsModule {}