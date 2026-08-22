import { Host } from "@/common/enums/host.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class BuscarOrdensServicoDto {
  @ApiProperty({
    enum: Host,
    example: Host.MANIA,
    description: "Conta Hubsoft a consultar",
  })
  @IsEnum(Host)
  host: Host;
}
