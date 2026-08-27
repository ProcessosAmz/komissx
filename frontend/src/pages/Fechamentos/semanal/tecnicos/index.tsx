import React, { useState } from "react";
import { useTecnicos } from "./hooks/useTecnicos";
import { TecnicosResumoCards } from "./components/TecnicosResumoCards";
import { TecnicosFilters } from "./components/TecnicosFilters";
import { TecnicosTable } from "./components/TecnicosTable";

export default function FechamentoTecnico() {
  const [filtroTecnico, setFiltroTecnico] = useState("TODOS");
  const [buscaOS, setBuscaOS] = useState("");

  const {
    dataInicio,
    dataFim,
    setDataInicio,
    setDataFim,
    dadosFiltrados,
    listaTecnicos,
    resumo,
    loading,
    erro,
    totalSincronizados,
    handleExcluir,
    handleAlterarStatus,
  } = useTecnicos(filtroTecnico, buscaOS);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Fechamento Técnico</h1>
        <p className="text-sm text-slate-400 mt-1">
          Ordens da query Fechamento Instalação Técnico, com valores do painel de regras semanais.
        </p>
      </div>

      <div className="bg-indigo-950/20 border border-indigo-500/20 px-4 py-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-indigo-400">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>
            Motor ativo sincronizando {totalSincronizados} tabelas de técnicos terceirizados.
          </span>
        </div>
      </div>

      <TecnicosFilters
        dataInicio={dataInicio}
        dataFim={dataFim}
        setDataInicio={setDataInicio}
        setDataFim={setDataFim}
        filtroTecnico={filtroTecnico}
        setFiltroTecnico={setFiltroTecnico}
        buscaOS={buscaOS}
        setBuscaOS={setBuscaOS}
        listaTecnicos={listaTecnicos}
      />

      {erro ? (
        <div className="bg-red-950/20 border border-red-500/20 px-4 py-3 rounded-xl text-sm text-red-300">
          {erro}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 font-medium text-sm">
          <span className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
          Carregando instalações do Metabase...
        </div>
      ) : (
        <>
          <TecnicosResumoCards resumo={resumo} />
          <TecnicosTable
            dados={dadosFiltrados}
            onAlterarStatus={handleAlterarStatus}
            onExcluir={handleExcluir}
          />
        </>
      )}
    </>
  );
}
