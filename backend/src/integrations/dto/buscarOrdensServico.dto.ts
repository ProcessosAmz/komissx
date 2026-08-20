import { Host } from "@/common/enums/host.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

// dto pode ser descartado, já que agora vamos usar o host do path da requisição, e não mais do body
export class BuscarOrdensServicoDto {
  @ApiProperty({
    enum: Host,
    example: Host.MANIA,
    description: "Conta Hubsoft a consultar",
  })
  @IsEnum(Host)
  host: Host;
}
