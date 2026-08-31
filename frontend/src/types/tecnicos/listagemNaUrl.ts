import { LISTAGEM_AUTO } from "@/pages/Fechamentos/semanal/tecnicos/constants";
import type { FiltroListagemTecnicos } from "@/types/tecnicos/filtroListagemTecnicos";

export type ListagemNaUrl = FiltroListagemTecnicos | typeof LISTAGEM_AUTO;
