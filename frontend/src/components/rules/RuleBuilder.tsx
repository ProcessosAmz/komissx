import { Plus, Trash2 } from "lucide-react";
import type { Condition, Action, RuleEscopo, PersonType, ClosingLine } from "@/engine/types";

const CAMPOS: Array<{ value: string; label: string; tipo: "text" | "number" | "bool" }> = [
    { value: "pessoa.nome", label: "Pessoa · Nome", tipo: "text" },
    { value: "pessoa.tipo", label: "Pessoa · Tipo", tipo: "text" },
    { value: "pessoa.grupo", label: "Pessoa · Grupo", tipo: "text" },
    { value: "venda.plano", label: "Venda · Plano", tipo: "text" },
    { value: "venda.velocidadeMB", label: "Venda · Velocidade MB", tipo: "number" },
    { value: "venda.clienteNovo", label: "Venda · Cliente Novo", tipo: "bool" },
    { value: "meta.produto", label: "Meta · Produto", tipo: "text" },
    { value: "meta.quantidade", label: "Meta · Quantidade", tipo: "number" },
    { value: "valorBase", label: "Valor Base", tipo: "number" },
];

const OPERADORES = [
    { value: "eq", label: "igual a" },
    { value: "neq", label: "diferente de" },
    { value: "contains", label: "contém" },
    { value: "gte", label: "≥" },
    { value: "lte", label: "≤" },
] as const;

const RELATORIOS: Array<{ value: NonNullable<RuleEscopo["relatorio"]>; label: string }> = [
    { value: "FECHAMENTO_TECNICO", label: "Fechamento Técnico" },
    { value: "FECHAMENTO_RETIRADA", label: "Fechamento Retirada" },
    { value: "FECHAMENTO_VENDA", label: "Fechamento Venda" },
];

const TIPOS_PESSOA: PersonType[] = [
    "TECNICO", "AUTONOMO", "VENDEDOR", "SUPERVISOR", "COORDENADOR", "CONSULTOR",
];

interface Props {
    escopo: RuleEscopo;
    condicoes: Condition[];
    acoes: Action[];
    onChangeEscopo: (e: RuleEscopo) => void;
    onChangeCondicoes: (c: Condition[]) => void;
    onChangeAcoes: (a: Action[]) => void;
}

export function RuleBuilder({
    escopo, condicoes, acoes,
    onChangeEscopo, onChangeCondicoes, onChangeAcoes,
}: Props) {
    const addCond = () =>
        onChangeCondicoes([...condicoes, { op: "eq", campo: "pessoa.nome", valor: "" }]);
    const updateCond = (i: number, patch: Partial<Condition>) =>
        onChangeCondicoes(condicoes.map((c, idx) => (idx === i ? { ...c, ...patch } as Condition : c)));
    const removeCond = (i: number) =>
        onChangeCondicoes(condicoes.filter((_, idx) => idx !== i));

    const addAcao = () =>
        onChangeAcoes([...acoes, { tipo: "SET_VALOR", expressao: { tipo: "FIXO", valor: 0 } }]);
    const updateAcao = (i: number, patch: Action) =>
        onChangeAcoes(acoes.map((a, idx) => (idx === i ? patch : a)));
    const removeAcao = (i: number) =>
        onChangeAcoes(acoes.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-6">
            {/* ESCOPO */}
            <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Escopo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="Empresa" value={escopo.empresa ?? ""} onChange={(v) => onChangeEscopo({ ...escopo, empresa: v || undefined })} placeholder="ex: AMAZONET" />
                    <Input label="Unidade" value={escopo.unidade ?? ""} onChange={(v) => onChangeEscopo({ ...escopo, unidade: v || undefined })} placeholder="ex: MANAUS" />
                    <Select label="Relatório" value={escopo.relatorio ?? ""} onChange={(v) => onChangeEscopo({ ...escopo, relatorio: (v || undefined) as RuleEscopo["relatorio"] })} options={[{ value: "", label: "Todos" }, ...RELATORIOS]} />
                    <Select label="Tipo de pessoa" value={escopo.tipoPessoa ?? ""} onChange={(v) => onChangeEscopo({ ...escopo, tipoPessoa: (v || undefined) as PersonType })} options={[{ value: "", label: "Todos" }, ...TIPOS_PESSOA.map((t) => ({ value: t, label: t }))]} />
                    <Input label="Nome contém" value={escopo.nomeContem ?? ""} onChange={(v) => onChangeEscopo({ ...escopo, nomeContem: v || undefined })} placeholder="ex: LOBATO" />
                    <Input label="Grupo" value={escopo.grupo ?? ""} onChange={(v) => onChangeEscopo({ ...escopo, grupo: v || undefined })} placeholder="ex: VENDAS" />
                </div>
            </section>

            {/* CONDIÇÕES */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Condições (AND)</h3>
                    <button onClick={addCond} className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                        <Plus className="h-3 w-3" /> adicionar
                    </button>
                </div>
                <div className="space-y-2">
                    {condicoes.length === 0 && (
                        <p className="text-xs text-slate-500 italic py-3 text-center border border-dashed border-slate-800 rounded-xl">
                            Sem condições — a regra sempre será aplicada dentro do escopo.
                        </p>
                    )}
                    {condicoes.map((c, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 bg-[#05080f] border border-slate-800 rounded-xl p-2">
                            <select
                                value={c.campo}
                                onChange={(e) => updateCond(i, { campo: e.target.value } as Partial<Condition>)}
                                className="bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                            >
                                {CAMPOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <select
                                value={c.op}
                                onChange={(e) => updateCond(i, { op: e.target.value } as Partial<Condition>)}
                                className="bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                            >
                                {OPERADORES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <input
                                value={String(c.valor ?? "")}
                                onChange={(e) => {
                                    const field = CAMPOS.find((f) => f.value === c.campo);
                                    const valor = field?.tipo === "number" ? Number(e.target.value) : e.target.value;
                                    updateCond(i, { valor } as Partial<Condition>);
                                }}
                                className="flex-1 min-w-[120px] bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                                placeholder="valor"
                            />
                            <button onClick={() => removeCond(i)} className="p-1.5 text-slate-500 hover:text-red-400">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* AÇÕES */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ações (executa em ordem)</h3>
                    <button onClick={addAcao} className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                        <Plus className="h-3 w-3" /> adicionar
                    </button>
                </div>
                <div className="space-y-2">
                    {acoes.length === 0 && (
                        <p className="text-xs text-slate-500 italic py-3 text-center border border-dashed border-slate-800 rounded-xl">
                            Nenhuma ação — a regra não altera nada.
                        </p>
                    )}
                    {acoes.map((a, i) => (
                        <AcaoRow key={i} acao={a} onChange={(next) => updateAcao(i, next)} onRemove={() => removeAcao(i)} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function AcaoRow({ acao, onChange, onRemove }: { acao: Action; onChange: (a: Action) => void; onRemove: () => void }) {
    return (
        <div className="flex flex-wrap items-center gap-2 bg-[#05080f] border border-slate-800 rounded-xl p-2">
            <select
                value={acao.tipo}
                onChange={(e) => onChange({ tipo: e.target.value } as Action)}
                className="bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
            >
                <option value="SET_VALOR">Definir valor</option>
                <option value="BONUS_FIXO">Bônus fixo</option>
                <option value="PORCENTAGEM_SOBRE">% sobre</option>
                <option value="SET_STATUS_FINANCEIRO">Status fin.</option>
                <option value="OBSERVAR">Observação</option>
            </select>

            {acao.tipo === "SET_VALOR" && (
                <div className="flex items-center gap-1">
                    <select
                        value={acao.expressao.tipo}
                        onChange={(e) => onChange({ tipo: "SET_VALOR", expressao: { tipo: e.target.value as "FIXO", valor: 0 } })}
                        className="bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                    >
                        <option value="FIXO">fixo</option>
                        <option value="PERCENTUAL_VALOR_BASE">% valor base</option>
                    </select>
                    <input
                        type="number"
                        value={acao.expressao.tipo === "FIXO" ? acao.expressao.valor : acao.expressao.percentual}
                        onChange={(e) => {
                            const num = Number(e.target.value);
                            if (acao.expressao.tipo === "FIXO") onChange({ tipo: "SET_VALOR", expressao: { tipo: "FIXO", valor: num } });
                            else onChange({ tipo: "SET_VALOR", expressao: { tipo: "PERCENTUAL_VALOR_BASE", percentual: num } });
                        }}
                        className="w-24 bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono"
                    />
                </div>
            )}

            {acao.tipo === "BONUS_FIXO" && (
                <input
                    type="number"
                    value={acao.valor}
                    onChange={(e) => onChange({ tipo: "BONUS_FIXO", valor: Number(e.target.value) })}
                    className="w-24 bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono"
                />
            )}

            {acao.tipo === "PORCENTAGEM_SOBRE" && (
                <>
                    <input
                        value={acao.campo}
                        onChange={(e) => onChange({ tipo: "PORCENTAGEM_SOBRE", campo: e.target.value, percentual: acao.percentual })}
                        className="w-32 bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono"
                        placeholder="campo"
                    />
                    <input
                        type="number"
                        value={acao.percentual}
                        onChange={(e) => onChange({ tipo: "PORCENTAGEM_SOBRE", campo: acao.campo, percentual: Number(e.target.value) })}
                        className="w-20 bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono"
                    />
                    <span className="text-xs text-slate-500">%</span>
                </>
            )}

            {acao.tipo === "SET_STATUS_FINANCEIRO" && (
                <select
                    value={acao.status}
                    onChange={(e) => onChange({ tipo: "SET_STATUS_FINANCEIRO", status: e.target.value as Action extends { tipo: "SET_STATUS_FINANCEIRO" } ? never : never })}
                    className="bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                >
                    <option value="PAGO">PAGO</option>
                    <option value="NAO_PAGO">NÃO PAGO</option>
                    <option value="EM_ANALISE">EM ANÁLISE</option>
                </select>
            )}

            {acao.tipo === "OBSERVAR" && (
                <input
                    value={acao.texto}
                    onChange={(e) => onChange({ tipo: "OBSERVAR", texto: e.target.value })}
                    placeholder="texto da observação"
                    className="flex-1 min-w-[160px] bg-[#0a0f1c] border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
                />
            )}

            <button onClick={onRemove} className="p-1.5 text-slate-500 hover:text-red-400 ml-auto">
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <label className="block">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full bg-[#0a0f1c] border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
        </label>
    );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
    return (
        <label className="block">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full bg-[#0a0f1c] border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </label>
    );
}
