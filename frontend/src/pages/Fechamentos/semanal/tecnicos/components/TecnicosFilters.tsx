import { Search } from "lucide-react";
import type { TecnicoFechamento } from "@/types/reports";
import type {
  EmpresaFechamento,
  FiltroListagemTecnicos,
  PeriodoFechamento,
} from "@/types/tecnicos";
import {
  isEmpresaFechamento,
  isFiltroListagem,
} from "@/pages/Fechamentos/semanal/tecnicos/services/queryTecnicos.helper";
import { TecnicosDatePicker } from "@/pages/Fechamentos/semanal/tecnicos/components/TecnicosDatePicker";
import type { ContagemListagemTecnicos } from "@/types/tecnicos/contagemListagemTecnicos";

interface FiltersProps {
  dataInicio: string;
  dataFim: string;
  setPeriodo: (periodo: PeriodoFechamento) => void;
  filtroEmpresa: EmpresaFechamento;
  setFiltroEmpresa: (value: EmpresaFechamento) => void;
  filtroTecnico: string;
  setFiltroTecnico: (value: string) => void;
  filtroListagem: FiltroListagemTecnicos;
  setFiltroListagem: (value: FiltroListagemTecnicos) => void;
  contagemListagem: ContagemListagemTecnicos;
  buscaOS: string;
  setBuscaOS: (value: string) => void;
  listaTecnicos: TecnicoFechamento[];
  carregando: boolean;
}

const campoClasse =
  "w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

export function TecnicosFilters({
  dataInicio,
  dataFim,
  setPeriodo,
  filtroEmpresa,
  setFiltroEmpresa,
  filtroTecnico,
  setFiltroTecnico,
  filtroListagem,
  setFiltroListagem,
  contagemListagem,
  buscaOS,
  setBuscaOS,
  listaTecnicos,
  carregando,
}: FiltersProps) {
  const temDuplicados = contagemListagem.duplicados > 0;
  const selectListagemClasse =
    filtroListagem === "duplicados" || temDuplicados
      ? `${campoClasse} border-amber-500 bg-amber-950/40 text-amber-100 focus:border-amber-400`
      : campoClasse;

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/30 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Empresa
        </span>
        <select
          value={filtroEmpresa}
          onChange={(event) => {
            const valor = event.target.value;
            if (isEmpresaFechamento(valor)) {
              setFiltroEmpresa(valor);
            }
          }}
          className={campoClasse}
        >
          <option value="amazonet">Amazonet</option>
          <option value="mania">Mania</option>
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Período
        </span>
        <TecnicosDatePicker
          dataInicio={dataInicio}
          dataFim={dataFim}
          onChange={setPeriodo}
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Técnico
        </span>
        <select
          value={filtroTecnico}
          disabled={carregando}
          onChange={(event) => setFiltroTecnico(event.target.value)}
          className={campoClasse}
        >
          {listaTecnicos.map((tecnico) => (
            <option key={tecnico.id} value={tecnico.id}>
              {tecnico.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-amber-400">
          Listagem
        </span>
        <select
          value={filtroListagem}
          disabled={carregando}
          onChange={(event) => {
            const valor = event.target.value;
            if (isFiltroListagem(valor)) {
              setFiltroListagem(valor);
            }
          }}
          className={selectListagemClasse}
        >
          <option value="TODOS">Tudo ({contagemListagem.TODOS})</option>
          <option value="duplicados">
            Duplicados ({contagemListagem.duplicados})
          </option>
          <option value="pendente-auditoria">
            Pendentes de auditoria ({contagemListagem["pendente-auditoria"]})
          </option>
          <option value="aprovados">
            Aprovados ({contagemListagem.aprovados})
          </option>
          <option value="reprovado">
            Reprovado ({contagemListagem.reprovado})
          </option>
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Buscar
        </span>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="OS, cliente ou técnico"
            value={buscaOS}
            disabled={carregando}
            onChange={(event) => setBuscaOS(event.target.value)}
            className={`${campoClasse} pl-9`}
          />
        </div>
      </label>
    </div>
  );
}
