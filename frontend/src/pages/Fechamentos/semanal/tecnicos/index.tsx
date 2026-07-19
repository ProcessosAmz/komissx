// src/pages/Fechamentos/semanal/tecnicos/index.tsx
import React, { useState } from 'react';
import { useTecnicos } from './hooks/useTecnicos';
import { TecnicosResumoCards } from './components/TecnicosResumoCards';
import { TecnicosFilters } from './components/TecnicosFilters';
import { TecnicosTable } from './components/TecnicosTable';

export default function FechamentoTecnico() {
  const [filtroTecnico, setFiltroTecnico] = useState<string>('TODOS');
  const [buscaOS, setBuscaOS] = useState<string>('');

  const { 
    dadosFiltrados, 
    listaTecnicos, 
    resumo, 
    loading, 
    totalSincronizados, 
    handleExcluir, 
    handleAlterarStatus 
  } = useTecnicos(filtroTecnico, buscaOS);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 font-medium text-sm">
        <span className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
        Carregando instâncias do Motor de Regras...
      </div>
    );
  }

  return (
    <>
      {/* Títulos e Identificação da Tela */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Fechamento Técnico</h1>
        <p className="text-sm text-slate-400 mt-1">
          Valores herdados em tempo real a partir das definições do Painel Administrativo.
        </p>
      </div>

      {/* Notificação Sincronizada via ConfigService */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 px-4 py-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-indigo-400">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>Motor ativo sincronizando {totalSincronizados} tabelas de técnicos terceirizados.</span>
        </div>
      </div>

      {/* Componentes Decompostos e Isolados */}
      <TecnicosResumoCards resumo={resumo} />

      <TecnicosFilters 
        filtroTecnico={filtroTecnico} 
        setFiltroTecnico={setFiltroTecnico} 
        buscaOS={buscaOS} 
        setBuscaOS={setBuscaOS} 
        listaTecnicos={listaTecnicos} 
      />

      <TecnicosTable 
        dados={dadosFiltrados} 
        onAlterarStatus={handleAlterarStatus} 
        onExcluir={handleExcluir} 
      />
    </>
  );
}