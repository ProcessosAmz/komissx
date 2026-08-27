import { ChevronRight } from "lucide-react";
import { TecnicoRowViewModel } from "../../../types";

interface TableProps {
  dados: TecnicoRowViewModel[];
  onAbrirDetalhe: (os: TecnicoRowViewModel) => void;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusRelatorio(os: TecnicoRowViewModel): "APROVADO" | "REPROVADO" {
  return os.status_financeiro === "PAGO" ? "APROVADO" : "REPROVADO";
}

export function TecnicosTable({ dados, onAbrirDetalhe }: TableProps) {
  if (dados.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 px-6 py-16 text-center text-sm text-slate-500">
        Nenhuma instalação encontrada para os técnicos cadastrados neste período.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/20">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Nº</th>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Cód O.S</th>
            <th className="px-4 py-3">Técnico</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Financeiro</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {dados.map((os, indice) => {
            const status = statusRelatorio(os);
            return (
              <tr
                key={os.id}
                onClick={() => onAbrirDetalhe(os)}
                className="cursor-pointer transition-colors hover:bg-slate-900/40"
              >
                <td className="px-4 py-3 text-slate-500">{indice + 1}</td>
                <td className="px-4 py-3 font-medium uppercase text-slate-200">
                  {os.conta}
                </td>
                <td className="px-4 py-3 font-medium text-slate-200">
                  {os.codigo_cliente}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-indigo-400">
                  {os.numero_ordem_servico}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {os.usuario_fechamento_limpo}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      status === "APROVADO"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {os.status_financeiro}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-200">
                  {formatarMoeda(os.valor_a_pagar)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
