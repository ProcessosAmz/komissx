// features/fechamentos/semanal/tecnicos/components/TecnicosResumoCards.tsx
import React from 'react';
import { ResumoFechamentoDTO } from '../../../types';

interface CardsProps { resumo: ResumoFechamentoDTO; }

export const TecnicosResumoCards: React.FC<CardsProps> = ({ resumo }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
      <p className="text-xs font-medium text-slate-400 uppercase">A Pagar Estimado</p>
      <p className="text-2xl font-bold text-emerald-400 mt-1">R$ {resumo.totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
      <p className="text-xs font-medium text-slate-400 uppercase">Volume OS</p>
      <p className="text-2xl font-bold text-white mt-1">{resumo.totalOS}</p>
    </div>
    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
      <p className="text-xs font-medium text-slate-400 uppercase">Aprovadas (Pagas)</p>
      <p className="text-2xl font-bold text-indigo-400 mt-1">{resumo.aprovadas}</p>
    </div>
    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
      <p className="text-xs font-medium text-slate-400 uppercase">Glosas</p>
      <p className="text-2xl font-bold text-red-400 mt-1">{resumo.reprovadas}</p>
    </div>
  </div>
);