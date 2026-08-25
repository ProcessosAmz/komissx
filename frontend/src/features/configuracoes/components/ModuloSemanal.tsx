import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Edit2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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

const CATEGORIA_UI: Record<
  CategoriaTabela,
  {
    titulo: string;
    coluna: string;
    botao: string;
    campoNome: string;
    tituloCriar: string;
    tituloEditar: string;
  }
> = {
  tecnicos: {
    titulo: "Técnicos terceirizados",
    coluna: "Nome do técnico",
    botao: "Adicionar técnico",
    campoNome: "Nome do técnico",
    tituloCriar: "Adicionar técnico",
    tituloEditar: "Editar técnico",
  },
  retirada: {
    titulo: "Retirada",
    coluna: "UF",
    botao: "Adicionar UF",
    campoNome: "UF",
    tituloCriar: "Adicionar UF",
    tituloEditar: "Editar UF",
  },
  autonomos: {
    titulo: "Exceções de autônomos",
    coluna: "Nome do autônomo",
    botao: "Adicionar autônomo",
    campoNome: "Nome do autônomo",
    tituloCriar: "Adicionar autônomo",
    tituloEditar: "Editar autônomo",
  },
};

function toNumber(valor: number | string | null): number {
  return Number(valor ?? 0);
}

function fraseExclusao(nome: string): string {
  return `DELETAR ${nome}`;
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

function TabelaSkeleton() {
  return (
    <div className="bg-[#05080f] rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-4 py-3 bg-[#090d16] border-b border-slate-800 flex justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>
      <div className="px-4 py-3 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}

function ModuloSemanalSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-3 w-64" />
      </div>
      <TabelaSkeleton />
      <TabelaSkeleton />
      <Skeleton className="h-20 w-full rounded-xl" />
      <TabelaSkeleton />
    </div>
  );
}

type DialogFormulario =
  | {
      tipo: "criar";
      categoria: CategoriaTabela;
    }
  | {
      tipo: "editar";
      categoria: CategoriaTabela;
      regraId: number;
    }
  | {
      tipo: "padrao";
      regraId: number;
    }
  | {
      tipo: "excluir";
      regraId: number;
      nome: string;
    };

export function ModuloSemanal() {
  const { data: rules = [], isLoading, isError } = useCommissionRules();
  const { create, update, remove } = useMutateCommissionRules();
  const [dialog, setDialog] = useState<DialogFormulario | null>(null);
  const [formulario, setFormulario] = useState({ nome: "", valor: "" });
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");

  const padrao = rules.find(
    (regra) =>
      regra.evento === "sale" && (regra.filters ?? "").toUpperCase() === "PADRAO",
  );

  const fecharDialog = () => {
    setDialog(null);
    setFormulario({ nome: "", valor: "" });
    setConfirmacaoExclusao("");
  };

  const abrirCriar = (categoria: CategoriaTabela) => {
    setFormulario({ nome: "", valor: "" });
    setDialog({ tipo: "criar", categoria });
  };

  const abrirEditar = (categoria: CategoriaTabela, regra: CommissionRuleApi) => {
    setFormulario({
      nome: regra.nome,
      valor: String(toNumber(regra.valor)),
    });
    setDialog({ tipo: "editar", categoria, regraId: regra.id });
  };

  const abrirExcluir = (regra: CommissionRuleApi) => {
    setConfirmacaoExclusao("");
    setDialog({ tipo: "excluir", regraId: regra.id, nome: regra.nome });
  };

  const abrirPadrao = () => {
    if (!padrao) {
      return;
    }

    setFormulario({
      nome: padrao.nome,
      valor: String(toNumber(padrao.valor)),
    });
    setDialog({ tipo: "padrao", regraId: padrao.id });
  };

  const salvarDialog = () => {
    if (dialog?.tipo === "excluir") {
      if (confirmacaoExclusao !== fraseExclusao(dialog.nome)) {
        return;
      }

      remove.mutate(dialog.regraId);
      fecharDialog();
      return;
    }

    if (formulario.valor === "") {
      return;
    }

    if (dialog?.tipo === "criar") {
      if (!formulario.nome.trim()) {
        return;
      }

      create.mutate({
        nome: formulario.nome.trim(),
        evento: EVENTO[dialog.categoria],
        valor: Number(formulario.valor),
      });
      fecharDialog();
      return;
    }

    if (dialog?.tipo === "editar") {
      if (!formulario.nome.trim()) {
        return;
      }

      update.mutate({
        id: dialog.regraId,
        payload: {
          nome: formulario.nome.trim(),
          valor: Number(formulario.valor),
        },
      });
      fecharDialog();
      return;
    }

    if (dialog?.tipo === "padrao") {
      update.mutate({
        id: dialog.regraId,
        payload: { valor: Number(formulario.valor) },
      });
      fecharDialog();
    }
  };

  const tituloDialog =
    dialog?.tipo === "padrao"
      ? "Atualizar valor padrão"
      : dialog?.tipo === "excluir"
        ? "Confirmar exclusão"
        : dialog
          ? dialog.tipo === "criar"
            ? CATEGORIA_UI[dialog.categoria].tituloCriar
            : CATEGORIA_UI[dialog.categoria].tituloEditar
          : "";

  const labelNome =
    dialog && dialog.tipo !== "padrao" && dialog.tipo !== "excluir"
      ? CATEGORIA_UI[dialog.categoria].campoNome
      : "";

  const fraseAtual =
    dialog?.tipo === "excluir" ? fraseExclusao(dialog.nome) : "";
  const podeExcluir =
    dialog?.tipo === "excluir" && confirmacaoExclusao === fraseAtual;

  const copiarFrase = () => {
    void navigator.clipboard.writeText(fraseAtual);
  };

  const renderTabela = (categoria: CategoriaTabela, delay: number) => {
    const lista = regrasDaCategoria(rules, categoria);
    const ui = CATEGORIA_UI[categoria];

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }}
      >
        <div className="bg-[#05080f] rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 bg-[#090d16] border-b border-slate-800 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-200">{ui.titulo}</h4>
            <Button
              type="button"
              className="h-9 bg-indigo-600 hover:bg-indigo-500"
              onClick={() => abrirCriar(categoria)}
            >
              <Plus className="h-4 w-4" />
              {ui.botao}
            </Button>
          </div>

          <div className="divide-y divide-slate-800/40 px-4">
            <div className="grid grid-cols-12 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <div className="col-span-6">{ui.coluna}</div>
              <div className="col-span-3 text-right">Valor</div>
              <div className="col-span-3 text-center">Ações</div>
            </div>

            {lista.length === 0 ? (
              <p className="text-slate-600 py-4 text-center text-xs">
                Nenhum valor configurado.
              </p>
            ) : (
              <AnimatePresence initial={false}>
                {lista.map((regra) => (
                  <motion.div
                    key={regra.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-12 py-2.5 items-center gap-1 text-xs rounded-lg hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="col-span-6 text-slate-300 truncate">
                      {regra.nome}
                    </div>
                    <div className="col-span-3 text-right text-emerald-400 font-semibold">
                      R$ {toNumber(regra.valor).toFixed(2)}
                    </div>
                    <div className="col-span-3 flex justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => abrirEditar(categoria, regra)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirExcluir(regra)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return <ModuloSemanalSkeleton />;
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="text-base font-semibold text-slate-200">
          Relatório semanal
        </h3>
        <p className="text-xs text-slate-500">
          Controle de comissões semanal para os diferentes módulos de negócios.
        </p>
      </motion.div>

      {renderTabela("tecnicos", 0.05)}
      {renderTabela("retirada", 0.1)}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="bg-[#05080f] rounded-xl border border-slate-800 p-4 flex justify-between items-center gap-3"
      >
        <div>
          <span className="text-sm font-semibold text-slate-200 block">
            Autônomos
          </span>
          <span className="text-xs text-slate-500">Valor padrão por venda</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-emerald-400 font-semibold">
            R$ {padrao ? toNumber(padrao.valor).toFixed(2) : "0.00"}
          </span>
          <Button
            type="button"
            className="h-9 bg-indigo-600 hover:bg-indigo-500"
            onClick={abrirPadrao}
            disabled={!padrao}
          >
            Editar
          </Button>
        </div>
      </motion.div>

      {renderTabela("autonomos", 0.2)}

      <Dialog
        open={dialog !== null}
        onOpenChange={(aberto) => !aberto && fecharDialog()}
      >
        <DialogContent className="bg-[#090d16] border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tituloDialog}</DialogTitle>
            <DialogDescription className="text-slate-500">
              {dialog?.tipo === "excluir"
                ? "Copie a mensagem abaixo e cole no campo para confirmar a exclusão."
                : "Informe os dados e confirme para salvar no catálogo de comissões."}
            </DialogDescription>
          </DialogHeader>

          {dialog?.tipo === "excluir" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#05080f] px-3 py-2">
                <code className="text-xs text-red-300 break-all">
                  {fraseAtual}
                </code>
                <button
                  type="button"
                  onClick={copiarFrase}
                  className="text-slate-400 hover:text-slate-200 shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">
                  Cole a mensagem aqui
                </label>
                <Input
                  value={confirmacaoExclusao}
                  onChange={(evento) =>
                    setConfirmacaoExclusao(evento.target.value)
                  }
                  placeholder={fraseAtual}
                  className={inputClassName}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dialog?.tipo !== "padrao" && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">{labelNome}</label>
                  <Input
                    value={formulario.nome}
                    onChange={(evento) =>
                      setFormulario((atual) => ({
                        ...atual,
                        nome: evento.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Valor (R$)</label>
                <Input
                  type="number"
                  value={formulario.valor}
                  onChange={(evento) =>
                    setFormulario((atual) => ({
                      ...atual,
                      valor: evento.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-300"
              onClick={fecharDialog}
            >
              Cancelar
            </Button>
            {dialog?.tipo === "excluir" ? (
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-500"
                onClick={salvarDialog}
                disabled={!podeExcluir || remove.isPending}
              >
                Excluir
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-500"
                onClick={salvarDialog}
                disabled={create.isPending || update.isPending}
              >
                Salvar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}