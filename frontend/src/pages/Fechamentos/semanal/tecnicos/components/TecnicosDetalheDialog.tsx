import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusAuditoria, TecnicoRowViewModel } from "../../../types";

interface DetalheProps {
  ordem: TecnicoRowViewModel | null;
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  onAlterarStatus: (id: string, status: StatusAuditoria) => void;
  onExcluir: (id: string) => void;
}

function formatarData(dataIso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(dataIso)) {
    return dataIso || "—";
  }

  const [ano, mes, dia] = dataIso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function valorOuTraco(valor: string | null | undefined): string {
  return valor && valor.trim().length > 0 ? valor : "—";
}

function ItemDetalhe({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm text-slate-200 break-words">{value}</p>
    </div>
  );
}

export function TecnicosDetalheDialog({
  ordem,
  aberto,
  onAbertoChange,
  onAlterarStatus,
  onExcluir,
}: DetalheProps) {
  if (!ordem) {
    return null;
  }

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-slate-800 bg-[#0b0f19] text-slate-100 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>OS {ordem.numero_ordem_servico}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {valorOuTraco(ordem.nome_cliente)} · cliente {valorOuTraco(ordem.codigo_cliente)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          <ItemDetalhe label="Técnico" value={valorOuTraco(ordem.usuario_fechamento_limpo)} />
          <ItemDetalhe label="Usuário Hubsoft" value={valorOuTraco(ordem.usuario_fechamento)} />
          <ItemDetalhe label="Tipo" value={valorOuTraco(ordem.tipo_ordem_servico)} />
          <ItemDetalhe label="Conclusão" value={formatarData(ordem.data_termino_executado)} />
          <ItemDetalhe
            label="Cidade"
            value={`${valorOuTraco(ordem.cidade)}${ordem.estado ? `/${ordem.estado}` : ""}`}
          />
          <ItemDetalhe label="Bairro" value={valorOuTraco(ordem.bairro)} />
          <ItemDetalhe label="Abertura" value={valorOuTraco(ordem.usuario_abertura)} />
          <ItemDetalhe label="Empresa" value={ordem.conta === "mania" ? "Mania" : "Amazonet"} />
          <ItemDetalhe label="Etapa auditoria" value={valorOuTraco(ordem.etapa_instalacao)} />
          <ItemDetalhe label="Status instalação" value={valorOuTraco(ordem.status_instalacao)} />
          <div className="sm:col-span-2">
            <ItemDetalhe label="Motivo da instalação" value={valorOuTraco(ordem.motivo_instalacao)} />
          </div>
          <div className="sm:col-span-2">
            <ItemDetalhe label="Motivo de fechamento" value={valorOuTraco(ordem.motivo_fechamento)} />
          </div>
          <ItemDetalhe label="Financeiro" value={ordem.status_financeiro} />
          <ItemDetalhe label="Repasse" value={formatarMoeda(ordem.valor_a_pagar)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Status da auditoria
          </label>
          <select
            value={ordem.status_auditoria}
            onChange={(event) =>
              onAlterarStatus(ordem.id, event.target.value as StatusAuditoria)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="">—</option>
            <option value="PENDENTE">PENDENTE</option>
            <option value="APROVADO">APROVADO</option>
            <option value="REPROVADO">REPROVADO</option>
          </select>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              onExcluir(ordem.id);
              onAbertoChange(false);
            }}
            className="rounded-xl border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            Remover da lista
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
