import { useState } from "react";
import { Check, Edit2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCommissionRules,
  useMutateCommissionRules,
} from "@/hooks/useCommissionRules";
import type { CommissionRuleApi } from "@/service/commissionRulesService";

const inputClassName =
  "h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs text-slate-100";

type CategoriaTabela = "tecnicos" | "retirada" | "autonomos";

const EVENTO: Record<CategoriaTabela, CommissionRuleApi["evento"]> = {
  tecnicos: "installation",
  retirada: "removal",
  autonomos: "sale",
};

function toNumber(valor: number | string | null): number {
  return Number(valor ?? 0);
}

function regrasDaCategoria(
  rules: CommissionRuleApi[],
  categoria: CategoriaTabela,
): CommissionRuleApi[] {
  return rules.filter((regra) => {
    if (regra.evento !== EVENTO[categoria]) {
      return false;
    }

    if (categoria === "autonomos") {
      return (regra.filters ?? "").toUpperCase() !== "PADRAO";
    }

    return true;
  });
}

export function ModuloSemanal() {
  const { data: rules = [], isLoading, isError } = useCommissionRules();
  const { create, update, remove } = useMutateCommissionRules();
  const [novosCampos, setNovosCampos] = useState({
    tecnicos: { nome: "", valor: "" },
    retirada: { nome: "", valor: "" },
    autonomos: { nome: "", valor: "" },
  });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [valoresEdicao, setValoresEdicao] = useState({ nome: "", valor: "" });
  const [valorPadrao, setValorPadrao] = useState("");

  const padrao = rules.find(
    (regra) =>
      regra.evento === "sale" && (regra.filters ?? "").toUpperCase() === "PADRAO",
  );

  const adicionarItem = (categoria: CategoriaTabela) => {
    const campos = novosCampos[categoria];
    if (!campos.nome.trim() || campos.valor === "") {
      return;
    }

    create.mutate({
      nome: campos.nome.trim(),
      evento: EVENTO[categoria],
      valor: Number(campos.valor),
    });
    setNovosCampos((atual) => ({
      ...atual,
      [categoria]: { nome: "", valor: "" },
    }));
  };

  const salvarEdicao = (id: number) => {
    if (!valoresEdicao.nome.trim() || valoresEdicao.valor === "") {
      return;
    }

    update.mutate({
      id,
      payload: {
        nome: valoresEdicao.nome.trim(),
        valor: Number(valoresEdicao.valor),
      },
    });
    setEditandoId(null);
  };

  const salvarPadrao = () => {
    if (!padrao || valorPadrao === "") {
      return;
    }

    update.mutate({
      id: padrao.id,
      payload: { valor: Number(valorPadrao) },
    });
  };

  const renderTabela = (
    titulo: string,
    categoria: CategoriaTabela,
    labelColuna: string,
  ) => {
    const lista = regrasDaCategoria(rules, categoria);

    return (
      <div className="bg-[#05080f] rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 bg-[#090d16] border-b border-slate-800">
          <h4 className="text-sm font-semibold text-slate-200">{titulo}</h4>
        </div>

        <div className="p-3 bg-[#03060b] border-b border-slate-800/60 flex gap-2">
          <Input
            placeholder={`Novo ${labelColuna.toLowerCase()}`}
            value={novosCampos[categoria].nome}
            onChange={(evento) =>
              setNovosCampos((atual) => ({
                ...atual,
                [categoria]: { ...atual[categoria], nome: evento.target.value },
              }))
            }
            className={inputClassName}
          />
          <Input
            type="number"
            placeholder="R$"
            value={novosCampos[categoria].valor}
            onChange={(evento) =>
              setNovosCampos((atual) => ({
                ...atual,
                [categoria]: { ...atual[categoria], valor: evento.target.value },
              }))
            }
            className={`${inputClassName} w-24`}
          />
          <Button
            type="button"
            className="h-9 bg-indigo-600 hover:bg-indigo-500"
            onClick={() => adicionarItem(categoria)}
            disabled={create.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="divide-y divide-slate-800/40 px-4">
          <div className="grid grid-cols-12 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            <div className="col-span-6">{labelColuna}</div>
            <div className="col-span-3 text-right">Valor</div>
            <div className="col-span-3 text-center">Ações</div>
          </div>

          {lista.length === 0 ? (
            <p className="text-slate-600 py-4 text-center text-xs">
              Nenhum valor configurado.
            </p>
          ) : (
            lista.map((regra) => {
              const estaEditando = editandoId === regra.id;

              return (
                <div
                  key={regra.id}
                  className="grid grid-cols-12 py-2.5 items-center gap-1 text-xs"
                >
                  {estaEditando ? (
                    <>
                      <div className="col-span-6 pr-2">
                        <Input
                          value={valoresEdicao.nome}
                          onChange={(evento) =>
                            setValoresEdicao((atual) => ({
                              ...atual,
                              nome: evento.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={valoresEdicao.valor}
                          onChange={(evento) =>
                            setValoresEdicao((atual) => ({
                              ...atual,
                              valor: evento.target.value,
                            }))
                          }
                          className={`${inputClassName} text-right`}
                        />
                      </div>
                      <div className="col-span-3 flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => salvarEdicao(regra.id)}
                          className="text-emerald-400 p-1 rounded bg-emerald-500/10"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditandoId(null)}
                          className="text-slate-400 text-[10px]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-6 text-slate-300 truncate">
                        {regra.nome}
                      </div>
                      <div className="col-span-3 text-right text-emerald-400 font-semibold">
                        R$ {toNumber(regra.valor).toFixed(2)}
                      </div>
                      <div className="col-span-3 flex justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditandoId(regra.id);
                            setValoresEdicao({
                              nome: regra.nome,
                              valor: String(toNumber(regra.valor)),
                            });
                          }}
                          className="text-slate-400 hover:text-indigo-400"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove.mutate(regra.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Carregando comissões...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-400">
        Não foi possível carregar as comissões do backend.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-200">
          Relatório semanal
        </h3>
        <p className="text-xs text-slate-500">
          Valores de GET /commissions/rules.
        </p>
      </div>

      {renderTabela("Técnicos terceirizados", "tecnicos", "Alias")}
      {renderTabela("Retirada", "retirada", "UF")}

      <div className="bg-[#05080f] rounded-xl border border-slate-800 p-4 flex justify-between items-center gap-3">
        <div>
          <span className="text-sm font-semibold text-slate-200 block">
            Autônomos
          </span>
          <span className="text-xs text-slate-500">Valor padrão por venda</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-semibold">R$</span>
          <Input
            type="number"
            defaultValue={padrao ? toNumber(padrao.valor) : 0}
            onChange={(evento) => setValorPadrao(evento.target.value)}
            className={`${inputClassName} w-20 text-center text-emerald-400`}
          />
          <Button
            type="button"
            className="h-9 bg-indigo-600 hover:bg-indigo-500"
            onClick={salvarPadrao}
            disabled={!padrao || update.isPending}
          >
            Salvar
          </Button>
        </div>
      </div>

      {renderTabela("Exceções de autônomos", "autonomos", "Nome")}
    </div>
  );
}