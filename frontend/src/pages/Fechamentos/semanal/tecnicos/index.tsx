import { useState } from "react";
import { useTecnicos } from "./hooks/useTecnicos";
import { TecnicosResumoCards } from "./components/TecnicosResumoCards";
import { TecnicosFilters } from "./components/TecnicosFilters";
import { TecnicosTable } from "./components/TecnicosTable";
import { TecnicosDetalheDialog } from "./components/TecnicosDetalheDialog";
import { TecnicoRowViewModel } from "../../types";

export default function FechamentoTecnico() {
  const [filtroTecnico, setFiltroTecnico] = useState("TODOS");
  const [filtroEmpresa, setFiltroEmpresa] = useState("TODAS");
  const [buscaOS, setBuscaOS] = useState("");
  const [ordemSelecionada, setOrdemSelecionada] = useState<TecnicoRowViewModel | null>(
    null,
  );

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
    handleExcluir,
    handleAlterarStatus,
  } = useTecnicos(filtroTecnico, buscaOS, filtroEmpresa);

  const ordemAtual =
    dadosFiltrados.find((item) => item.id === ordemSelecionada?.id) ?? ordemSelecionada;

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Fechamento de instalação
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Semana de quinta a quarta, inclusive. Instalação, mudança de endereço e NC
          entram no fechamento.
        </p>
      </div>

      <TecnicosFilters
        dataInicio={dataInicio}
        dataFim={dataFim}
        setDataInicio={setDataInicio}
        setDataFim={setDataFim}
        filtroEmpresa={filtroEmpresa}
        setFiltroEmpresa={setFiltroEmpresa}
        filtroTecnico={filtroTecnico}
        setFiltroTecnico={setFiltroTecnico}
        buscaOS={buscaOS}
        setBuscaOS={setBuscaOS}
        listaTecnicos={listaTecnicos}
      />

      {erro ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {erro}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-sm font-medium text-slate-400">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Carregando instalações...
        </div>
      ) : (
        <>
          <TecnicosResumoCards resumo={resumo} />
          <TecnicosTable
            dados={dadosFiltrados}
            onAbrirDetalhe={setOrdemSelecionada}
          />
        </>
      )}

      <TecnicosDetalheDialog
        ordem={ordemAtual}
        aberto={Boolean(ordemSelecionada)}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            setOrdemSelecionada(null);
          }
        }}
        onAlterarStatus={handleAlterarStatus}
        onExcluir={handleExcluir}
      />
    </>
  );
}
