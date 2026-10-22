import { DollarSign, Users, UserRound, ClipboardList } from "lucide-react";
import { formatarMoeda } from "../../domain/vendasComercial";
import type { ResumoVendasComercial } from "../../domain/types";

export function VendasComercialResumo({ resumo }: { resumo: ResumoVendasComercial }) {
  const cards = [["Total de vendas", String(resumo.quantidade), ClipboardList, "text-indigo-400"], ["Vendas da equipe", `${resumo.quantidadeDaEquipe} · ${formatarMoeda(resumo.valorDaEquipe)}`, Users, "text-emerald-400"], ["Vendas da liderança", `${resumo.quantidadeDoLider} · ${formatarMoeda(resumo.valorDoLider)}`, UserRound, "text-amber-400"], ["Elegíveis", `${resumo.quantidadeElegivel} · ${formatarMoeda(resumo.valorElegivel)}`, DollarSign, "text-white"]] as const;
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, accent]) => <div key={label} className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-4"><div className="flex items-center justify-between"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p><Icon className={`h-4 w-4 ${accent}`} /></div><p className={`mt-2 text-xl font-semibold tracking-tight ${accent}`}>{value}</p></div>)}</div>;
}
