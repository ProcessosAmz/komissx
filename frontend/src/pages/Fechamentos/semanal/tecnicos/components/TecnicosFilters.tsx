// features/fechamentos/semanal/tecnicos/components/TecnicosFilters.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface FiltersProps {
  filtroTecnico: string;
  setFiltroTecnico: (v: string) => void;
  buscaOS: string;
  setBuscaOS: (v: string) => void;
  listaTecnicos: string[];
}

export const TecnicosFilters: React.FC<FiltersProps> = ({ filtroTecnico, setFiltroTecnico, buscaOS, setBuscaOS, listaTecnicos }) => (
  <div className="grid gap-4 md:grid-cols-3 bg-[#0b0f19]/40 p-4 rounded-xl border border-slate-800/60 backdrop-blur-sm">
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">Filtrar Técnico</label>
      <select
        value={filtroTecnico}
        onChange={(e) => setFiltroTecnico(e.target.value)}
        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
      >
        {listaTecnicos.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
    <div className="md:col-span-2">
      <label className="block text-xs font-medium text-slate-400 mb-1.5">Filtro Global (OS / Cliente)</label>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por O.S..."
          value={buscaOS}
          onChange={(e) => setBuscaOS(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
        />
      </div>
    </div>
  </div>
);