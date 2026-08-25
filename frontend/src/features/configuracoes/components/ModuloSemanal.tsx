import { useEffect, useState } from "react";
import { Check, Edit2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useCommissionRules } from "@/hooks/useCommissionRules";
import type { FechamentoSemanalValores } from "@/service/commissionRulesService";

const inputClassName =
  "h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs text-slate-100";

const VALORES_VAZIOS: FechamentoSemanalValores = {
  tecnicosTerceirizados: {},
  retiradaEstado: {},
  autonomos: { valorPadrao: 0, excecoes: {} },
};

type CategoriaTabela = "tecnicos" | "retirada" | "autonomos";

export function ModuloSemanal() {
  const { data, isLoading, isError } = useCommissionRules();
  const [valores, setValores] = useState<FechamentoSemanalValores>(VALORES_VAZIOS);
  const [novosCampos, setNovosCampos] = useState({
    tecnicos: { nome: "", valor: "" },
    retirada: { nome: "", valor: "" },
    autonomos: { nome: "", valor: "" },
  });
  const [editando, setEditando] = useState<{
    categoria: CategoriaTabela;
    chaveOriginal: string;
  } | null>(null);
  const [valoresEdicao, setValoresEdicao] = useState({ nome: "", valor: "" });

  useEffect(() => {
    if (!data) {
      return;
    }

    setValores(data);
  }, [data]);

  const mapaPorCategoria: Record<CategoriaTabela, Record<string, number>> = {
    tecnicos: valores.tecnicosTerceirizados,
    retirada: valores.retiradaEstado,
    autonomos: valores.autonomos.excecoes,
  };

  const atualizarMapa = (
    categoria: CategoriaTabela,
    proximo: Record<string, number>,
  ) => {
    setValores((atual) => {
      switch (categoria) {
        case "tecnicos":
          return { ...atual, tecnicosTerceirizados: proximo };
        case "retirada":
          return { ...atual, retiradaEstado: proximo };
        default:
          return {
            ...atual,
            autonomos: { ...atual.autonomos, excecoes: proximo },
          };
      }
    });
  };

  const adicionarItem = (categoria: CategoriaTabela) => {
    const campos = novosCampos[categoria];
    if (!campos.nome.trim() || campos.valor === "") {
      return;
    }

    const chave = campos.nome.toUpperCase().trim();
    atualizarMapa(categoria, {
      ...mapaPorCategoria[categoria],
      [chave]: Number(campos.valor),
    });
    setNovosCampos((atual) => ({
      ...atual,
      [categoria]: { nome: "", valor: "" },
    }));
  };

  const removerItem = (categoria: CategoriaTabela, nome: string) => {
    const clone = { ...mapaPorCategoria[categoria] };
    delete clone[nome];
    atualizarMapa(categoria, clone);
    if (editando?.categoria === categoria && editando.chaveOriginal === nome) {
      setEditando(null);
    }
  };

  const salvarEdicao = (categoria: CategoriaTabela) => {
    if (!editando || !valoresEdicao.nome.trim() || valoresEdicao.valor === "") {
      return;
    }

    const clone = { ...mapaPorCategoria[categoria] };
    delete clone[editando.chaveOriginal];
    clone[valoresEdicao.nome.toUpperCase().trim()] = Number(valoresEdicao.valor);
    atualizarMapa(categoria, clone);
    setEditando(null);
  };

  const handleSalvar = () => {
    toast({
      variant: "success",
      title: "Valores do backend",
      description: "Leitura ok. Gravar alteração no banco ainda não está ligado.",
    });
  };

  const renderTabela = (
    titulo: string,
    categoria: CategoriaTabela,
    lista: Record<string, number>,
    labelColuna: string,
  ) => (
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

        {Object.entries(lista).length === 0 ? (
          <p className="text-slate-600 py-4 text-center text-xs">
            Nenhum valor configurado.
          </p>
        ) : (
          Object.entries(lista).map(([nome, valor]) => {
            const estaEditando =
              editando?.categoria === categoria &&
              editando.chaveOriginal === nome;

            return (
              <div
                key={nome}
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
                        onClick={() => salvarEdicao(categoria)}
                        className="text-emerald-400 p-1 rounded bg-emerald-500/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditando(null)}
                        className="text-slate-400 text-[10px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-6 text-slate-300 truncate">{nome}</div>
                    <div className="col-span-3 text-right text-emerald-400 font-semibold">
                      R$ {valor.toFixed(2)}
                    </div>
                    <div className="col-span-3 flex justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditando({ categoria, chaveOriginal: nome });
                          setValoresEdicao({
                            nome,
                            valor: String(valor),
                          });
                        }}
                        className="text-slate-400 hover:text-indigo-400"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removerItem(categoria, nome)}
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

      {renderTabela(
        "Técnicos terceirizados",
        "tecnicos",
        valores.tecnicosTerceirizados,
        "Alias",
      )}

      {renderTabela("Retirada", "retirada", valores.retiradaEstado, "UF")}

      <div className="bg-[#05080f] rounded-xl border border-slate-800 p-4 flex justify-between items-center">
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
            value={valores.autonomos.valorPadrao}
            onChange={(evento) =>
              setValores((atual) => ({
                ...atual,
                autonomos: {
                  ...atual.autonomos,
                  valorPadrao: Number(evento.target.value),
                },
              }))
            }
            className={`${inputClassName} w-20 text-center text-emerald-400`}
          />
        </div>
      </div>

      {renderTabela(
        "Exceções de autônomos",
        "autonomos",
        valores.autonomos.excecoes,
        "Nome",
      )}

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <Button
          type="button"
          className="bg-indigo-600 hover:bg-indigo-500"
          onClick={handleSalvar}
        >
          Salvar valores
        </Button>
      </div>
    </div>
  );
}