import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Search } from "lucide-react";
import { RetiradaService, type RetiradaRow } from "@/service/retiradaService";
import { ConfigService } from "@/config/ConfigService";

type Rules = { fechamento_semanal: { retirada_estado: Record<string, number> } };

const isoHoje = new Date().toISOString().slice(0, 10);
const isoInicioSemana = () => {
  const data = new Date();
  const dia = data.getDay();
  data.setDate(data.getDate() - (dia === 0 ? 6 : dia - 1));
  return data.toISOString().slice(0, 10);
};
const moeda = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Retirada() {
  const [dataInicio, setDataInicio] = useState(isoInicioSemana());
  const [dataFim, setDataFim] = useState(isoHoje);
  const [empresa, setEmpresa] = useState<"" | "amazonet" | "mania">("");
  const [busca, setBusca] = useState("");
  const [rows, setRows] = useState<RetiradaRow[]>([]);
  const [rules, setRules] = useState<Rules | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    setLoading(true);
    setErro("");
    try {
      const [dados, configuracao] = await Promise.all([
        RetiradaService.buscar({ dataInicio, dataFim, ...(empresa ? { empresa } : {}) }),
        ConfigService.getInstance().loadConfigurations(),
      ]);
      setRows(dados);
      setRules(configuracao as Rules);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar o fechamento de retirada.");
    } finally {
      setLoading(false);
    }
  };

  const dados = useMemo(() => rows.filter((row) => {
    const texto = `${row.numero_ordem_servico} ${row.codigo_cliente} ${row.cidade} ${row.estado} ${row.vendedor}`.toLowerCase();
    return texto.includes(busca.toLowerCase());
  }), [rows, busca]);

  const valorPorEstado = rules?.fechamento_semanal.retirada_estado ?? {};
  const valor = (row: RetiradaRow) => valorPorEstado[String(row.estado ?? "").trim().toUpperCase()] ?? 0;
  const entregues = dados.filter((row) => row.pago);
  const total = entregues.reduce((sum, row) => sum + valor(row), 0);

  return (
    <div className="min-h-screen space-y-6 bg-slate-950 p-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold">Fechamento Semanal - Retirada</h1>
        <p className="mt-1 text-sm text-slate-400">Conciliação do relatório Metabase com a planilha de entregas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-5">
        <label className="text-xs text-slate-400">Data inicial<input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm text-white" /></label>
        <label className="text-xs text-slate-400">Data final<input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm text-white" /></label>
        <label className="text-xs text-slate-400">Empresa<select value={empresa} onChange={(e) => setEmpresa(e.target.value as typeof empresa)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm text-white"><option value="">Todas</option><option value="amazonet">Amazonet</option><option value="mania">Mania</option></select></label>
        <label className="text-xs text-slate-400">Buscar<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="OS, cliente ou cidade" className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm text-white" /></label>
        <button onClick={() => void carregar()} disabled={loading} className="mt-auto flex h-10 items-center justify-center gap-2 rounded bg-emerald-600 px-4 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}Consultar</button>
      </div>

      {erro && <div className="flex items-center gap-2 rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-200"><AlertCircle size={17} />{erro}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400">Registros no relatório</p><strong className="text-2xl">{dados.length}</strong></div>
        <div className="rounded-xl border border-emerald-900 bg-slate-900 p-4"><p className="text-xs text-slate-400">Entregues e aptos a pagar</p><strong className="text-2xl text-emerald-400">{entregues.length}</strong></div>
        <div className="rounded-xl border border-emerald-900 bg-slate-900 p-4"><p className="text-xs text-slate-400">Total a pagar</p><strong className="text-2xl text-emerald-400">{moeda(total)}</strong></div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm"><thead className="bg-slate-950 text-xs uppercase text-slate-400"><tr><th className="p-3">OS</th><th className="p-3">Cliente</th><th className="p-3">Cidade/UF</th><th className="p-3">Responsável</th><th className="p-3">Conciliação</th><th className="p-3 text-right">Valor</th></tr></thead><tbody className="divide-y divide-slate-800">{dados.map((row) => <tr key={row.id} className="text-slate-300"><td className="p-3 font-mono">{row.numero_ordem_servico || "-"}</td><td className="p-3">{row.codigo_cliente || "-"}</td><td className="p-3">{row.cidade || "-"}/{row.estado || "-"}</td><td className="p-3">{row.vendedor || "-"}</td><td className="p-3">{row.pago ? <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 size={15} />Entregue - PAGO</span> : <span className="text-amber-400">Não localizada na planilha</span>}</td><td className="p-3 text-right font-semibold">{row.pago ? moeda(valor(row)) : moeda(0)}</td></tr>)}</tbody></table>
        {dados.length === 0 && !loading && <p className="p-8 text-center text-sm text-slate-500">Nenhum registro encontrado.</p>}
      </div>
    </div>
  );
}
