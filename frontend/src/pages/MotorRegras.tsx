import { useState } from "react";
import { Plus, Search, Save, Play, X } from "lucide-react";
import { useRules } from "@/stores/rules.store";
import { evaluateLine } from "@/engine/evaluator";
import { RuleBuilder } from "@/components/rules/RuleBuilder";
import { PageHeader } from "@/components/layout/PageHeader";
import { Can } from "@/features/auth/Can";
import type { Rule, RuleEscopo, Condition, Action, ClosingLine, PersonType } from "@/engine/types";

const SAMPLE_LINE: ClosingLine = {
    id: "sample-1",
    empresa: "AMAZONET",
    unidade: "MANAUS",
    relatorio: "FECHAMENTO_VENDA",
    pessoa: { tipo: "VENDEDOR" as PersonType, nome: "LOBATO DA SILVA" },
    venda: { plano: "Fibra", velocidadeMB: 600, clienteNovo: true },
    status: "APROVADO",
    valorBase: 5000,
};

export default function MotorRegras() {
    const { rules, addRule, toggleRule, removeRule } = useRules();
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<Rule | null>(null);
    const [simResult, setSimResult] = useState<string | null>(null);

    const filtered = rules.filter((r) => r.nome.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <PageHeader
                title="Motor de Regras"
                subtitle="Regras configuráveis que calculam pagamentos e status financeiros."
                action={
                    <Can perm="rules:manage">
                        <button
                            onClick={() => setEditing({
                                id: `rg_${Date.now()}`,
                                nome: "Nova regra",
                                versao: 1,
                                ativa: true,
                                escopo: {},
                                condicoes: [],
                                acoes: [],
                                criadoEm: new Date().toISOString(),
                            })}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg"
                        >
                            <Plus className="h-4 w-4" /> Nova Regra
                        </button>
                    </Can>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* LISTA */}
                <div className="xl:col-span-5 bg-[#090d16] border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar regra..."
                                className="w-full bg-[#0a0f1c] border border-slate-700 rounded-2xl pl-11 py-3 text-sm focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-auto flex-1">
                        <table className="w-full">
                            <thead className="bg-[#05080f] sticky top-0">
                                <tr className="text-[11px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                                    <th className="text-left pl-5 py-3">Nome</th>
                                    <th className="text-left py-3">Versão</th>
                                    <th className="text-right pr-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((rule) => (
                                    <tr key={rule.id} className="border-b border-slate-800 hover:bg-slate-900/40 cursor-pointer" onClick={() => setEditing(rule)}>
                                        <td className="pl-5 py-3 text-sm">{rule.nome}</td>
                                        <td className="py-3">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-400">
                                                v{rule.versao}
                                            </span>
                                        </td>
                                        <td className="pr-5 py-3 text-right">
                                            <Can perm="rules:manage" fallback={<span className="text-[10px] text-slate-500">{rule.ativa ? "Ativa" : "Inativa"}</span>}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleRule(rule.id); }}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${rule.ativa ? "bg-indigo-600" : "bg-slate-700"}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${rule.ativa ? "translate-x-5" : "translate-x-1"}`} />
                                                </button>
                                            </Can>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={3} className="py-8 text-center text-xs text-slate-500">Nenhuma regra encontrada.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAINEL DIREITO: simular + criar */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Play className="h-4 w-4 text-indigo-400" /> Simulador rápido
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Aplica as regras acima na linha de exemplo.</p>
                        <button
                            onClick={() => {
                                const r = evaluateLine(SAMPLE_LINE, rules);
                                setSimResult(JSON.stringify(r, null, 2));
                            }}
                            className="mt-4 inline-flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg"
                        >
                            <Play className="h-3 w-3" /> Rodar com linha de exemplo
                        </button>
                        {simResult && (
                            <pre className="mt-4 bg-[#05080f] border border-slate-800 rounded-xl p-4 text-[11px] font-mono text-slate-300 overflow-x-auto">
                                {simResult}
                            </pre>
                        )}
                    </div>

                    {editing && (
                        <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-medium">Editor de regra</h3>
                                <button onClick={() => setEditing(null)} className="text-slate-500 hover:text-slate-300">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="text-[11px] text-slate-500 uppercase tracking-wider">Nome da regra</label>
                                <input
                                    value={editing.nome}
                                    onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
                                    className="mt-1 w-full bg-[#0a0f1c] border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <RuleBuilder
                                escopo={editing.escopo}
                                condicoes={editing.condicoes}
                                acoes={editing.acoes}
                                onChangeEscopo={(escopo: RuleEscopo) => setEditing({ ...editing, escopo })}
                                onChangeCondicoes={(condicoes: Condition[]) => setEditing({ ...editing, condicoes })}
                                onChangeAcoes={(acoes: Action[]) => setEditing({ ...editing, acoes })}
                            />

                            <div className="flex items-center justify-end gap-2 pt-6 mt-6 border-t border-slate-800">
                                <button onClick={() => { removeRule(editing.id); setEditing(null); }} className="text-xs text-red-400 hover:text-red-300 px-3 py-2">
                                    Excluir
                                </button>
                                <button
                                    onClick={() => { addRule(editing); setEditing(null); }}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg"
                                >
                                    <Save className="h-4 w-4" /> Salvar regra
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
