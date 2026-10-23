import { AlertCircle, FileText, Users } from "lucide-react";
import { useVendasComercial } from "../application/useVendasComercial";
import { statusComercialDisponiveis, montarModeloRelatorioComercial } from "../domain/vendasComercial";
import { gerarRelatorioAnaliticoComercial, gerarRelatorioPagamentoComercial } from "../infrastructure/relatoriosVendasComercial";
import { VendasComercialFiltros } from "./components/VendasComercialFiltros";
import { VendasComercialManualForm } from "./components/VendasComercialManualForm";
import { VendasComercialResumo } from "./components/VendasComercialResumo";
import { VendasComercialTabela } from "./components/VendasComercialTabela";
import { obterConfiguracaoMensal } from "@/config/configuracaoMensal";

export function FechamentoComercialPage() {
  const modelo = useVendasComercial();
  const modeloRelatorio = montarModeloRelatorioComercial({
    dataInicio: modelo.dataInicio,
    dataFim: modelo.dataFim,
    empresa: modelo.empresa,
    vendas: modelo.dados,
    colaboradores: modelo.colaboradores,
    lideranca: modelo.lider?.isLider ? modelo.lider.name : undefined,
    supervisao: modelo.lider?.isSupervisor
      ? modelo.lider.name
      : modelo.lider?.supervisorName ?? undefined,
    configuracaoMensal: obterConfiguracaoMensal(),
  });
  const statusDisponiveis = statusComercialDisponiveis(modelo.dados);
  return <div className="space-y-6 p-6 text-slate-100 lg:p-8"><div><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5"><Users className="h-5 w-5 text-emerald-400" /></div><div><h1 className="text-2xl font-bold tracking-tight text-white">Fechamento comercial</h1><p className="mt-1 text-sm text-slate-400">Vendas da liderança e da equipe vinculada no período consultado.</p></div></div><div className="flex flex-wrap gap-2"><button type="button" disabled={modelo.loading || !modelo.dados.length} onClick={() => gerarRelatorioPagamentoComercial(modeloRelatorio)} className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-50"><FileText size={15} />Pagamento PDF</button><button type="button" disabled={modelo.loading || !modelo.dados.length} onClick={() => gerarRelatorioAnaliticoComercial(modeloRelatorio)} className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-50"><FileText size={15} />Analítico PDF</button></div></div>{modelo.lider && <p className="mt-3 text-sm text-emerald-300">Estrutura selecionada: <strong>{modelo.lider.name}</strong> · {modelo.lider.roleName}</p>}</div><VendasComercialFiltros dataInicio={modelo.dataInicio} dataFim={modelo.dataFim} empresa={modelo.empresa} liderId={modelo.liderId} busca={modelo.busca} lideres={modelo.opcoesLideranca} loading={modelo.loading} onDataInicio={modelo.setDataInicio} onDataFim={modelo.setDataFim} onEmpresa={modelo.setEmpresa} onLider={modelo.setLiderId} onBusca={modelo.setBusca} onConsultar={() => void modelo.consultar()} /><VendasComercialManualForm empresa={modelo.empresa} colaboradores={modelo.colaboradores} onSubmit={(input) => { if (!modelo.adicionarManual(input)) window.alert("Já existe uma venda com a mesma empresa, OS e cliente nesta sessão."); }} />{modelo.erro && <div className="flex items-center gap-2 rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-200"><AlertCircle size={17} />{modelo.erro}</div>}{modelo.loading ? <div className="flex items-center justify-center p-16 text-sm text-slate-400"><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />Carregando vendas comerciais...</div> : <><VendasComercialResumo resumo={modelo.resumo} /><VendasComercialTabela dados={modelo.dados} statusDisponiveis={statusDisponiveis} onAlterarStatus={modelo.alterarStatus} onDesconsiderar={modelo.desconsiderar} onRestaurar={modelo.restaurar} onRemoverManual={(venda) => modelo.removerManual(venda.id)} /></>}</div>;
}
