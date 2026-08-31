import { useState } from "react";
import { useTecnicos } from "./hooks/useTecnicos";
import { TecnicosResumoCards } from "./components/TecnicosResumoCards";
import { TecnicosFilters } from "./components/TecnicosFilters";
import { TecnicosTable } from "./components/TecnicosTable";
import { TecnicosDuplicadosBanner } from "./components/TecnicosDuplicadosBanner";
import { TecnicosDetalheDialog } from "./components/TecnicosDetalheDialog";
import { TecnicosDocumentos } from "./components/TecnicosDocumentos";
import { TecnicoRowViewModel } from "../../types";
import { TecnicoService } from "./services/tecnicoService";

export default function FechamentoTecnico() {
  const [ordemSelecionada, setOrdemSelecionada] = useState<TecnicoRowViewModel | null>(
    null,
  );

  const {
    dataInicio,
    dataFim,
    setDataInicio,
    setDataFim,
    filtroEmpresa,
    setFiltroEmpresa,
    filtroTecnico,
    setFiltroTecnico,
    filtroListagem,
    setFiltroListagem,
    contagemListagem,
    quantidadePorCliente,
    buscaOS,
    setBuscaOS,
    dadosBase,
    dadosFiltrados,
    listaTecnicos,
    resumo,
    loading,
    erro,
    handleExcluir,
    handleAlterarStatus,
  } = useTecnicos();

  const ordemAtual =
    dadosFiltrados.find((item) => item.id === ordemSelecionada?.id) ??
    dadosBase.find((item) => item.id === ordemSelecionada?.id) ??
    ordemSelecionada;

  const clientesDuplicados = new Set(
    dadosBase
      .filter(
        (os) =>
          (quantidadePorCliente.get(TecnicoService.chaveCliente(os)) ?? 0) > 1,
      )
      .map((os) => TecnicoService.chaveCliente(os)),
  );

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Fechamento de instalação
          </h1>
        </div>
        <TecnicosDocumentos
          dados={dadosBase}
          desabilitado={loading || dadosBase.length === 0}
        />
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
        filtroListagem={filtroListagem}
        setFiltroListagem={setFiltroListagem}
        contagemListagem={contagemListagem}
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
          <TecnicosDuplicadosBanner
            visivel={contagemListagem.duplicados > 0}
            quantidadeOs={contagemListagem.duplicados}
            quantidadeClientes={clientesDuplicados.size}
            onFiltrarDuplicados={() => setFiltroListagem("duplicados")}
          />
          <TecnicosTable
            dados={dadosFiltrados}
            quantidadePorCliente={quantidadePorCliente}
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
