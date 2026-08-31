import type { OrdemServico } from "@/pages/Fechamentos/types";
import type { TecnicoFechamento } from "@/types/reports/tecnicoFechamento";

export type RelatorioTecnicoResponse = {
  data: OrdemServico[];
  tecnicos: TecnicoFechamento[];
  message: string;
};
