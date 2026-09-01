import { useState } from "react";
import { Plus } from "lucide-react";
import { useTecnicos } from "@/pages/Fechamentos/semanal/tecnicos/hooks/useTecnicos";
import { TecnicosResumoCards } from "@/pages/Fechamentos/semanal/tecnicos/components/TecnicosResumoCards";
import { TecnicosFilters } from "@/pages/Fechamentos/semanal/tecnicos/components/TecnicosFilters";
import { TecnicosTable } from "@/pages/Fechamentos/semanal/tecnicos/components/TecnicosTable";
import { TecnicosDuplicadosBanner } from "@/pages/Fechamentos/semanal/tecnicos/components/TecnicosDuplicadosBanner";
import { TecnicosDetalheDialog } from "@/pages/Fechamentos/semanal/tecnicos/components/TecnicosDetalheDialog";
import { TecnicosDocumentos } from "@/pages/Fechamentos/semanal/tecnicos/components/TecnicosDocumentos";
import { TecnicosAdicionarOsDialog } from "@/pages/Fechamentos/semanal/tecnicos/components/TecnicosAdicionarOsDialog";
import { TecnicoRowViewModel } from "@/pages/Fechamentos/types";
import { resolverOrdemAtual, listarClientesDuplicados } from "@/pages/Fechamentos/semanal/tecnicos/services/tecnico.helper";

export default function FechamentoTecnico() {
  const [ordemSelecionada, setOrdemSelecionada] = useState<TecnicoRowViewModel | null>(
    null,
  );

  const {
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
    quantidadePorCliente,
    buscaOS,
    setBuscaOS,
    dadosBase,
    dadosFiltrados,
    dadosBrutos,
    listaTecnicos,
    resumo,
    loading,
    erro,
    handleExcluir,
    handleAlterarStatus,
    handleAdicionarOs,
  } = useTecnicos();

  const [dialogAdicionarAberto, setDialogAdicionarAberto] = useState(false);

  const ordemAtual = resolverOrdemAtual(
    ordemSelecionada,
    dadosFiltrados,
    dadosBase,
  );
  const clientesDuplicados = listarClientesDuplicados(
    dadosBase,
    quantidadePorCliente,
  );

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Fechamento de instalação
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => setDialogAdicionarAberto(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-indigo-500/40 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            Adicionar O.S.
          </button>
          <TecnicosDocumentos
            dados={dadosBase}
            desabilitado={loading || dadosBase.length === 0}
          />
        </div>
      </div>

      <TecnicosFilters
        dataInicio={dataInicio}
        dataFim={dataFim}
        setPeriodo={setPeriodo}
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
        carregando={loading}
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

      <TecnicosAdicionarOsDialog
        aberto={dialogAdicionarAberto}
        onAbertoChange={setDialogAdicionarAberto}
        empresa={filtroEmpresa}
        dataTerminoPadrao={dataFim}
        filtroTecnico={filtroTecnico}
        listaTecnicos={listaTecnicos}
        ordensExistentes={dadosBrutos}
        onAdicionar={handleAdicionarOs}
      />
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
