import { Module } from "@nestjs/common";
import { FinancialClosesController } from "@/module/financial-closes/financial-closes.controller";
import { FinancialClosesService } from "@/module/financial-closes/financial-closes.service";

@Module({
  controllers: [FinancialClosesController],
  providers: [FinancialClosesService],
  exports: [FinancialClosesService],
})
export class FinancialClosesModule {}
