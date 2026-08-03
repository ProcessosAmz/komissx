// import { HttpService } from "@nestjs/axios";
// import { Injectable } from "@nestjs/common";
// import { firstValueFrom } from "rxjs";
// import { RelatorioTecnicoDto } from "src/reports/dto/relatorio-tecnico-instalacao.dto";
// import { MetabaseParameter } from "../common/interfaces/metabase-parameter.interface";
// import { METABASE_INSTALLATION_FILTERS } from "./metabase.constants";

// @Injectable()
// export class MetaService {
//   constructor(private readonly http: HttpService) {}

//   private montarParametros(dto: RelatorioTecnicoDto): MetabaseParameter[] {
//     const parametros: MetabaseParameter[] = [];

//     for (const [key, value] of Object.entries(dto)) {
//       if (!value) continue;

//       const config =
//         METABASE_INSTALLATION_FILTERS[
//           key as keyof typeof METABASE_INSTALLATION_FILTERS
//         ];

//       if (!config) continue;

//       parametros.push({
//         type: config.type,
//         value,
//         target: ["variable", ["template-tag", config.tag]],
//       });
//     }

//     return parametros;
//   }

//   async vendasTecnico(dto: RelatorioTecnicoDto) {
//     const parameters = this.montarParametros(dto);

//     const response = await firstValueFrom(
//       this.http.get(process.env.METABASE_INSTALACAO_TECNICO!, {
//         params: {
//           parameters: JSON.stringify(parameters),
//         },
//         timeout: 120000,
//       }),
//     );

//     return {
//       success: true,
//       total: response.data.length,
//       data: response.data,
//     };
//   }
// }
