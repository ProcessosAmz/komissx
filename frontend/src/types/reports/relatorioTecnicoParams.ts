import type { OrdemServico } from "@/pages/Fechamentos/types";

export type RelatorioTecnicoParams = {
  dataInicio: string;
  dataFim: string;
  empresa: OrdemServico["conta"];
  estado?: string;
  cidade?: string;
  tecnico?: string;
};
