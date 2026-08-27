import { ChevronRight } from "lucide-react";
import { StatusAuditoria, TecnicoRowViewModel } from "../../../types";

interface TableProps {
  dados: TecnicoRowViewModel[];
  onAbrirDetalhe: (os: TecnicoRowViewModel) => void;
}

function formatarData(dataIso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(dataIso)) {
    return dataIso || "—";
  }

  const [ano, mes, dia] = dataIso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function classeStatus(status: StatusAuditoria): string {
  switch (status) {
    case "APROVADO":
      return "bg-emerald-500/10 text-emerald-400";
    case "NC APROVADO":
      return "bg-cyan-500/10 text-cyan-400";
    case "REPROVADO":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-amber-500/10 text-amber-400";
  }
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
            <th className="px-4 py-3">OS</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Técnico</th>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Auditoria</th>
            <th className="px-4 py-3 text-right">Repasse</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {dados.map((os) => (
            <tr
              key={os.id}
              onClick={() => onAbrirDetalhe(os)}
              className="cursor-pointer transition-colors hover:bg-slate-900/40"
            >
              <td className="px-4 py-3 font-mono text-xs text-indigo-400">
                {os.numero_ordem_servico}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-200">{os.codigo_cliente}</p>
                <p className="max-w-[220px] truncate text-xs text-slate-500">
                  {os.nome_cliente || "—"}
                </p>
              </td>
              <td className="px-4 py-3 text-slate-300">{os.usuario_fechamento_limpo}</td>
              <td className="px-4 py-3 text-slate-400">
                {formatarData(os.data_termino_executado)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${classeStatus(os.status_auditoria)}`}
                >
                  {os.status_auditoria}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-200">
                {formatarMoeda(os.valor_a_pagar)}
              </td>
              <td className="px-4 py-3 text-slate-600">
                <ChevronRight className="h-4 w-4" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
