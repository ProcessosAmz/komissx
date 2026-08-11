import { Module } from "@nestjs/common";
import { CommissionsService } from "@/module/commissions/service/index.service";
import { CommissionsController } from "@/module/commissions/controller/index.controller";

@Module({
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
