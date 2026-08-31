import { Download, FileText } from "lucide-react";
import type { TecnicoRowViewModel } from "@/pages/Fechamentos/types";
import {
  gerarRelatorioTecnicos,
} from "../services/documentosTecnicos";
import { gerarReciboTecnicos } from "@/pages/Fechamentos/semanal/tecnicos/services/reciboTecnicos.helper";

interface TecnicosDocumentosProps {
  dados: TecnicoRowViewModel[];
  desabilitado?: boolean;
}

const botaoClasse =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-indigo-500/40 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50";

export function TecnicosDocumentos({
  dados,
  desabilitado = false,
}: TecnicosDocumentosProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={botaoClasse}
        disabled={desabilitado}
        onClick={() => gerarRelatorioTecnicos(dados)}
      >
        <FileText className="h-4 w-4 text-indigo-400" />
        Gerar relatório
      </button>
      <button
        type="button"
        className={botaoClasse}
        disabled={desabilitado}
        onClick={() => gerarReciboTecnicos(dados)}
      >
        <Download className="h-4 w-4 text-emerald-400" />
        Gerar recibo
      </button>
    </div>
  );
}
