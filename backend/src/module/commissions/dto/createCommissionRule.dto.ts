import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { CommissionEvent } from "@/common/enums/commissionEvent.enum";

export class CreateCommissionRuleDto {
  @ApiProperty({ example: "LOBATOS" })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ enum: CommissionEvent })
  @IsEnum(CommissionEvent)
  evento: CommissionEvent;

  @ApiProperty({ example: 90 })
  @IsNumber()
  @Min(0)
  valor: number;
}