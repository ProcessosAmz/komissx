import { DollarSign, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { ResumoFechamentoDTO } from "../../../types";

interface CardsProps {
  resumo: ResumoFechamentoDTO;
}

function formatarPagamento(dataIso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(dataIso)) {
    return dataIso;
  }

  return `${dataIso} 00:00:00`;
}

const cards = [
  {
    key: "totalReceber",
    label: "Total a receber",
    icon: DollarSign,
    accent: "text-emerald-400",
    format: (resumo: ResumoFechamentoDTO) =>
      resumo.totalReceber.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
  },
  {
    key: "aprovadas",
    label: "Aprovadas",
    icon: CheckCircle2,
    accent: "text-indigo-400",
    format: (resumo: ResumoFechamentoDTO) => String(resumo.aprovadas),
  },
  {
    key: "reprovadas",
    label: "Reprovadas",
    icon: XCircle,
    accent: "text-red-400",
    format: (resumo: ResumoFechamentoDTO) => String(resumo.reprovadas),
  },
  {
    key: "totalOS",
    label: "Total OS",
    icon: ClipboardList,
    accent: "text-white",
    format: (resumo: ResumoFechamentoDTO) => String(resumo.totalOS),
  },
] as const;

export function TecnicosResumoCards({ resumo }: CardsProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-4 text-sm text-slate-300">
        <p>
          <span className="text-slate-500">Técnico:</span> {resumo.tecnico}
        </p>
        <p>
          <span className="text-slate-500">Período:</span> {resumo.periodo}
        </p>
        <p>
          <span className="text-slate-500">Pagamento:</span>{" "}
          {formatarPagamento(resumo.dataPagamento)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <Icon className={`h-4 w-4 ${card.accent}`} />
              </div>
              <p className={`mt-2 text-2xl font-semibold tracking-tight ${card.accent}`}>
                {card.format(resumo)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
