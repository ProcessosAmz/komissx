import { AlertTriangle, ChevronRight } from "lucide-react";
import { TecnicoRowViewModel } from "@/pages/Fechamentos/types";
import { chaveCliente } from "@/pages/Fechamentos/semanal/tecnicos/services/tecnico.helper";
import {
  classeStatusAuditoria,
  formatarMoeda,
  statusAuditoriaNaLista,
} from "@/pages/Fechamentos/semanal/tecnicos/services/tabelaTecnicos.helper";

interface TableProps {
  dados: TecnicoRowViewModel[];
  quantidadePorCliente: Map<string, number>;
  onAbrirDetalhe: (os: TecnicoRowViewModel) => void;
}

export function TecnicosTable({
  dados,
  quantidadePorCliente,
  onAbrirDetalhe,
}: TableProps) {
  if (dados.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 px-6 py-16 text-center text-sm text-slate-500">
        Nenhuma instalação encontrada para este filtro.
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
        <tbody>
          {dados.map((os, indice) => {
            const status = statusAuditoriaNaLista(os);
            const quantidadeCliente =
              quantidadePorCliente.get(chaveCliente(os)) ?? 1;
            const linhaDuplicada = quantidadeCliente > 1;

            return (
              <tr
                key={os.id}
                onClick={() => onAbrirDetalhe(os)}
                className={`cursor-pointer border-b border-slate-800/70 transition-colors hover:bg-slate-900/40 ${
                  linhaDuplicada
                    ? "border-l-4 border-l-amber-400 bg-amber-950/35"
                    : ""
                }`}
              >
                <td className="px-4 py-3 text-slate-500">{indice + 1}</td>
                <td className="px-4 py-3 font-medium uppercase text-slate-200">
                  {os.conta}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {linhaDuplicada ? (
                      <span className="inline-flex w-fit items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                        <AlertTriangle className="h-3 w-3" />
                        Duplicado · {quantidadeCliente} OS
                      </span>
                    ) : null}
                    <span className="font-medium text-slate-200">
                      {os.codigo_cliente}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-indigo-400">
                  {os.numero_ordem_servico}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {os.usuario_fechamento_limpo}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${classeStatusAuditoria(status)}`}
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
