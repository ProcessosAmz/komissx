import React from "react";
import { Search } from "lucide-react";

import { TecnicoFechamento } from "@/service/reportsService";

interface FiltersProps {
  dataInicio: string;
  dataFim: string;
  setDataInicio: (value: string) => void;
  setDataFim: (value: string) => void;
  filtroTecnico: string;
  setFiltroTecnico: (value: string) => void;
  buscaOS: string;
  setBuscaOS: (value: string) => void;
  listaTecnicos: TecnicoFechamento[];
}

export const TecnicosFilters: React.FC<FiltersProps> = ({
  dataInicio,
  dataFim,
  setDataInicio,
  setDataFim,
  filtroTecnico,
  setFiltroTecnico,
  buscaOS,
  setBuscaOS,
  listaTecnicos,
}) => (
  <div className="grid gap-4 md:grid-cols-4 bg-[#0b0f19]/40 p-4 rounded-xl border border-slate-800/60 backdrop-blur-sm">
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">Data início</label>
      <input
        type="date"
        value={dataInicio}
        onChange={(event) => setDataInicio(event.target.value)}
        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">Data fim</label>
      <input
        type="date"
        value={dataFim}
        onChange={(event) => setDataFim(event.target.value)}
        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">Filtrar Técnico</label>
      <select
        value={filtroTecnico}
        onChange={(event) => setFiltroTecnico(event.target.value)}
        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
      >
        {listaTecnicos.map((tecnico) => (
          <option key={tecnico.id} value={tecnico.id}>
            {tecnico.name}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">Filtro Global (OS / Cliente)</label>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por O.S..."
          value={buscaOS}
          onChange={(event) => setBuscaOS(event.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
        />
      </div>
    </div>
  </div>
);
