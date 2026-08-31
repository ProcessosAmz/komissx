import type { EmpresaFechamento } from "@/types/tecnicos/empresaFechamento";
import type { ListagemNaUrl } from "@/types/tecnicos/listagemNaUrl";
import type { PeriodoFechamento } from "@/types/tecnicos/periodoFechamento";

export interface FiltrosUrlTecnicos extends PeriodoFechamento {
  empresa: EmpresaFechamento;
  tecnico: string;
  busca: string;
  listagem: ListagemNaUrl;
}
