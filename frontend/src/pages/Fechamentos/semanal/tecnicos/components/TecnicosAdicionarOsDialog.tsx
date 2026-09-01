import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TecnicoFechamento } from "@/types/reports";
import type { DadosNovaOrdemServico, EmpresaFechamento, FormularioNovaOs } from "@/types/tecnicos";
import { TECNICO_TODOS } from "@/pages/Fechamentos/semanal/tecnicos/constants";
import { STATUS_AUDITORIA_FORM } from "@/pages/Fechamentos/semanal/tecnicos/constants";
import {
  isStatusAuditoriaForm,
  montarOrdemServicoManual,
  ordemManualDuplicada,
  validarNovaOrdemServico,
} from "@/pages/Fechamentos/semanal/tecnicos/services/adicionarOrdemServico.helper";
import { formularioInicial } from "@/pages/Fechamentos/semanal/tecnicos/services/formularioNovaOs.helper";
import type { OrdemServico } from "@/pages/Fechamentos/types";

const campoClasse =
  "w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-indigo-500";

interface TecnicosAdicionarOsDialogProps {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  empresa: EmpresaFechamento;
  dataTerminoPadrao: string;
  filtroTecnico: string;
  listaTecnicos: TecnicoFechamento[];
  ordensExistentes: OrdemServico[];
  onAdicionar: (ordem: OrdemServico) => void;
}

export function TecnicosAdicionarOsDialog({
  aberto,
  onAbertoChange,
  empresa,
  dataTerminoPadrao,
  filtroTecnico,
  listaTecnicos,
  ordensExistentes,
  onAdicionar,
}: TecnicosAdicionarOsDialogProps) {
  const tecnicosSelecionaveis = listaTecnicos.filter(
    (tecnico) => tecnico.id !== TECNICO_TODOS,
  );
  const tecnicoPadrao =
    filtroTecnico !== TECNICO_TODOS ? filtroTecnico : "";

  const [formulario, setFormulario] = useState<FormularioNovaOs>(() =>
    formularioInicial({
      tecnicoId: tecnicoPadrao,
      dataTermino: dataTerminoPadrao,
    }),
  );
  const [erro, setErro] = useState<string | null>(null);

  const resetar = (): void => {
    setFormulario(
      formularioInicial({
        tecnicoId: tecnicoPadrao,
        dataTermino: dataTerminoPadrao,
      }),
    );
    setErro(null);
  };

  useEffect(() => {
    if (aberto) {
      resetar();
    }
  }, [aberto]);

  const atualizarCampo = <Campo extends keyof FormularioNovaOs>(
    campo: Campo,
    valor: FormularioNovaOs[Campo],
  ): void => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  };

  const montarDados = (): DadosNovaOrdemServico | null => {
    const tecnico = tecnicosSelecionaveis.find(
      (item) => item.id === formulario.tecnicoId,
    );

    if (!tecnico) {
      return null;
    }

    return {
      codigoCliente: formulario.codigoCliente,
      nomeCliente: formulario.nomeCliente,
      numeroOs: formulario.numeroOs,
      tecnicoId: tecnico.id,
      tecnicoNome: tecnico.name,
      statusAuditoria: formulario.statusAuditoria,
      cidade: formulario.cidade,
      estado: formulario.estado,
      dataTermino: formulario.dataTermino,
      empresa,
    };
  };

  const confirmar = (): void => {
    const dados = montarDados();

    if (!dados) {
      setErro("Selecione o técnico.");
      return;
    }

    const mensagem = validarNovaOrdemServico(dados);

    if (mensagem) {
      setErro(mensagem);
      return;
    }

    if (ordemManualDuplicada(ordensExistentes, dados)) {
      setErro("Esta O.S. já está na listagem desta empresa.");
      return;
    }

    onAdicionar(montarOrdemServicoManual(dados));
    resetar();
    onAbertoChange(false);
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={(proximo) => {
        if (!proximo) {
          resetar();
        }
        onAbertoChange(proximo);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto border-slate-800 bg-[#0b0f19] text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar O.S.</DialogTitle>
          <DialogDescription className="text-slate-400">
            A ordem entra só neste fechamento, na empresa{" "}
            {empresa === "mania" ? "Mania" : "Amazonet"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Código do cliente
            </span>
            <input
              className={campoClasse}
              value={formulario.codigoCliente}
              onChange={(event) =>
                atualizarCampo("codigoCliente", event.target.value)
              }
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Número da O.S.
            </span>
            <input
              className={campoClasse}
              value={formulario.numeroOs}
              onChange={(event) => atualizarCampo("numeroOs", event.target.value)}
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Nome do cliente
            </span>
            <input
              className={campoClasse}
              value={formulario.nomeCliente}
              onChange={(event) =>
                atualizarCampo("nomeCliente", event.target.value)
              }
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Técnico
            </span>
            <select
              className={campoClasse}
              value={formulario.tecnicoId}
              onChange={(event) => atualizarCampo("tecnicoId", event.target.value)}
            >
              <option value="">Selecione...</option>
              {tecnicosSelecionaveis.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.id}>
                  {tecnico.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Status da auditoria
            </span>
            <select
              className={campoClasse}
              value={formulario.statusAuditoria}
              onChange={(event) => {
                const valor = event.target.value;
                if (isStatusAuditoriaForm(valor)) {
                  atualizarCampo("statusAuditoria", valor);
                }
              }}
            >
              {STATUS_AUDITORIA_FORM.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Data de conclusão
            </span>
            <input
              type="date"
              className={campoClasse}
              value={formulario.dataTermino}
              onChange={(event) =>
                atualizarCampo("dataTermino", event.target.value)
              }
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Cidade
            </span>
            <input
              className={campoClasse}
              value={formulario.cidade}
              onChange={(event) => atualizarCampo("cidade", event.target.value)}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Estado
            </span>
            <input
              className={campoClasse}
              maxLength={2}
              value={formulario.estado}
              onChange={(event) => atualizarCampo("estado", event.target.value)}
            />
          </label>
        </div>

        {erro ? (
          <p className="text-sm text-red-400">{erro}</p>
        ) : null}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onAbertoChange(false)}
            className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Adicionar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
