import { Search } from "lucide-react";
import { TecnicoFechamento } from "@/service/reportsService";

interface FiltersProps {
  dataInicio: string;
  dataFim: string;
  setDataInicio: (value: string) => void;
  setDataFim: (value: string) => void;
  filtroEmpresa: string;
  setFiltroEmpresa: (value: string) => void;
  filtroTecnico: string;
  setFiltroTecnico: (value: string) => void;
  buscaOS: string;
  setBuscaOS: (value: string) => void;
  listaTecnicos: TecnicoFechamento[];
}

const campoClasse =
  "w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-indigo-500";

export function TecnicosFilters({
  dataInicio,
  dataFim,
  setDataInicio,
  setDataFim,
  filtroEmpresa,
  setFiltroEmpresa,
  filtroTecnico,
  setFiltroTecnico,
  buscaOS,
  setBuscaOS,
  listaTecnicos,
}: FiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/30 p-4 md:grid-cols-2 lg:grid-cols-5">
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Empresa
        </span>
        <select
          value={filtroEmpresa}
          onChange={(event) => setFiltroEmpresa(event.target.value)}
          className={campoClasse}
        >
          <option value="TODAS">Amazonet e Mania</option>
          <option value="amazonet">Amazonet</option>
          <option value="mania">Mania</option>
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Início
        </span>
        <input
          type="date"
          value={dataInicio}
          onChange={(event) => setDataInicio(event.target.value)}
          className={campoClasse}
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Fim
        </span>
        <input
          type="date"
          value={dataFim}
          onChange={(event) => setDataFim(event.target.value)}
          className={campoClasse}
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Técnico
        </span>
        <select
          value={filtroTecnico}
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
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Buscar
        </span>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="OS, cliente ou técnico"
            value={buscaOS}
            onChange={(event) => setBuscaOS(event.target.value)}
            className={`${campoClasse} pl-9`}
          />
        </div>
      </label>
    </div>
  );
}
