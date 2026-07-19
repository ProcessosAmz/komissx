import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Building2, 
  Download, 
  FileText, 
  Layers
} from 'lucide-react';

// ============================================================================
// CONFIGURAÇÕES E CONSTANTES (Baseadas nas regras de negócio do Python)
// ============================================================================
const VALOR_PADRAO_VENDA = 50;

const EXCECOES_VALOR_VENDEDOR: Record<string, number> = {
  "JOSIVAN CARDOSO OLIVEIRA": 60,
  "JOSIVAN CARDOSO OLIVEIRA_AUTO_STM": 60
};

const CIDADE_SIGLA_PARA_NOME: Record<string, string> = {
  "MAO": "Manaus", "PFG": "Presidente Figueiredo", "PF": "Presidente Figueiredo",
  "MPU": "Manacapuru", "RPE": "Rio Preto da Eva", "IRA": "Iranduba",
  "IRB": "Iranduba", "PIN": "Parintins", "ITA": "Itacoatiara",
  "STM": "Santarém", "ALQ": "Alenquer", "MAB": "Marabá",
  "PRN": "Prainha", "MTA": "Monte Alegre", "OBI": "Óbidos",
  "ORX": "Oriximiná", "BEL": "Belterra", "MDC": "Mojuí dos Campos",
  "ITB": "Itaituba", "CUR": "Curuá", "URA": "Uruará", "ADC": "Alter do Chão",
};

// Mock de dados iniciais baseado no retorno esperado do Metabase
const MOCK_VENDAS_BASE = [
  { numero_ordem_servico: "1001", codigo_cliente: "CLI01", usuario_cadastro: "admin", vendedor: "CARLOS_AUTO_STM", status_auditoria: "APROVADO", motivo_comercial: "AUDITORIA - VENDA APROVADA", estado: "PA", cidade: "Santarém", conta: "amazonet", data_termino_executado: "2026-07-15" },
  { numero_ordem_servico: "1002", codigo_cliente: "CLI02", usuario_cadastro: "suporte", vendedor: "JOSIVAN CARDOSO OLIVEIRA_AUTO_STM", status_auditoria: "APROVADO", motivo_comercial: "AUDITORIA - VENDA APROVADA", estado: "PA", cidade: "Santarém", conta: "amazonet", data_termino_executado: "2026-07-16" },
  { numero_ordem_servico: "1003", codigo_cliente: "CLI03", usuario_cadastro: "vendas", vendedor: "MARIA_AUTO_MAO", status_auditoria: "REPROVADO", motivo_comercial: "REPROVADO TOTAL", estado: "AM", cidade: "Manaus", conta: "mania", data_termino_executado: "2026-07-17" },
  { numero_ordem_servico: "1004", codigo_cliente: "CLI04", usuario_cadastro: "admin", vendedor: "ANTONIO_AUTO_MAO", status_auditoria: "-", motivo_comercial: "-", estado: "AM", cidade: "Manaus", conta: "mania", data_termino_executado: "2026-07-18" },
];

interface OrdemServico {
  numero_ordem_servico: string;
  codigo_cliente: string;
  vendedor: string;
  status: string;
  financeiro: string;
  valor: number;
  cidade: string;
  estado: string;
  conta: string;
  usuario_cadastro: string;
  motivo_comercial: string;
  status_auditoria: string;
  data_termino_executado: string;
  isManual?: boolean;
}

export default function Autonomos() {
  // --- Estados do Filtro Base (Sidebar do original) ---
  const [dataInicio, setDataInicio] = useState("2026-07-12");
  const [dataFim, setDataFim] = useState("2026-07-19");
  const [contasSelecionadas, setContasSelecionadas] = useState<string[]>(["amazonet", "mania"]);
  const [dadosCarregados, setDadosCarregados] = useState(true);

  // --- Estados da Lista de Dados (Database em Memória) ---
  const [listaOS, setListaOS] = useState<OrdemServico[]>(() => {
    return MOCK_VENDAS_BASE.map(os => processarLinhaOS(os));
  });

  // --- Filtros de Refinamento de Tela ---
  const [filtroTipoOS, setFiltroTipoOS] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");
  const [filtroAuditoria, setFiltroAuditoria] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("Todos");

  // --- Form Manual ---
  const [manualCliente, setManualCliente] = useState("");
  const [manualOS, setManualOS] = useState("");
  const [manualStatus, setManualStatus] = useState("");
  const [showManual, setShowManual] = useState(false);

  // ==========================================
  // 🔹 FUNÇÕES DE INFERÊNCIA (LÓGICA PYTHON)
  // ==========================================
  function inferirCidadeEstadoPorNome(nome: string): { cidade: string; estado: string } {
    const nomeUp = nome.toUpperCase();
    for (const [sigla, city] of Object.entries(CIDADE_SIGLA_PARA_NOME)) {
      if (nomeUp.includes(`_${sigla}`) || nomeUp.includes(` ${sigla} `)) {
        const est = ["STM", "ALQ", "MAB", "PRN", "MTA", "OBI", "ORX", "BEL", "MDC", "ITB", "CUR", "URA", "ADC"].includes(sigla) ? "PA" : "AM";
        return { cidade: city, estado: est };
      }
    }
    return { cidade: "NÃO DEFINIDO", estado: "-" };
  }

  function calcularValorVenda(vendedor: string, status: string): number {
    const statusUp = status.toUpperCase();
    if (!["APROVADO", "N.C APROVADO"].includes(statusUp)) return 0;
    const vendedorUp = vendedor.toUpperCase();
    return EXCECOES_VALOR_VENDEDOR[vendedorUp] || VALOR_PADRAO_VENDA;
  }

  function classificarStatus(motivo: string, auditoria: string): string {
    const m = motivo.toUpperCase();
    const a = auditoria.toUpperCase();
    if (["AUDITORIA - VENDA APROVADA", "REANÁLISE - VENDA APROVADA"].includes(m) || a === "APROVADO") return "APROVADO";
    if (["QUALIDADE - NÃO CONFORMIDADE", "QUALIDADE - REANÁLISE", "N.C APROVADO"].includes(a)) return "N.C APROVADO";
    if (m === "REPROVADO TOTAL" || a === "REPROVADO") return "REPROVADO";
    return "-";
  }

  function processarLinhaOS(raw: any): OrdemServico {
    const status = classificarStatus(raw.motivo_comercial || "", raw.status_auditoria || "");
    const { cidade, estado } = inferirCidadeEstadoPorNome(raw.vendedor || "");
    const financeiro = ["APROVADO", "N.C APROVADO"].includes(status) ? "PAGO" : "-";
    const valor = calcularValorVenda(raw.vendedor || "", status);

    return {
      numero_ordem_servico: raw.numero_ordem_servico,
      codigo_cliente: raw.codigo_cliente,
      vendedor: raw.vendedor,
      status,
      financeiro,
      valor,
      cidade: raw.cidade || cidade,
      estado: raw.estado || estado,
      conta: raw.conta,
      usuario_cadastro: raw.usuario_cadastro,
      motivo_comercial: raw.motivo_comercial,
      status_auditoria: raw.status_auditoria,
      data_termino_executado: raw.data_termino_executado
    };
  }

  // ==========================================
  // ➕ INSERÇÃO MANUAL DE OS
  // ==========================================
  const handleAdicionarOSManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCliente || !manualOS || !manualStatus) {
      alert("Preencha todos os campos da OS manual.");
      return;
    }

    const tecnicoAmostra = filtroVendedor || "AUTONOMO_STM";
    const { cidade, estado } = inferirCidadeEstadoPorNome(tecnicoAmostra);
    const financeiro = ["APROVADO", "N.C APROVADO"].includes(manualStatus) ? "PAGO" : "-";
    
    const novaLinha: OrdemServico = {
      numero_ordem_servico: manualOS,
      codigo_cliente: manualCliente,
      vendedor: tecnicoAmostra,
      status: manualStatus,
      financeiro,
      valor: ["APROVADO", "N.C APROVADO"].includes(manualStatus) ? (EXCECOES_VALOR_VENDEDOR[tecnicoAmostra.toUpperCase()] || VALOR_PADRAO_VENDA) : 0,
      cidade: cidade !== "NÃO DEFINIDO" ? cidade : "Santarém",
      estado: estado !== "-" ? estado : "PA",
      conta: contasSelecionadas[0] || "amazonet",
      usuario_cadastro: "MANUAL",
      motivo_comercial: "INSERÇÃO MANUAL",
      status_auditoria: manualStatus,
      data_termino_executado: new Date().toISOString().split('T')[0],
      isManual: true
    };

    setListaOS(prev => [novaLinha, ...prev]);
    setManualCliente("");
    setManualOS("");
    setManualStatus("");
    setShowManual(false);
  };

  // ==========================================
  // 🔄 ALTERAÇÃO DINÂMICA DE TABELA (AUDITORIA MANUAL)
  // ==========================================
  const handleAlterarStatusTabela = (numeroOS: string, novoStatus: string) => {
    setListaOS(prev => prev.map(os => {
      if (os.numero_ordem_servico === numeroOS) {
        const financeiro = ["APROVADO", "N.C APROVADO"].includes(novoStatus) ? "PAGO" : "-";
        const valor = ["APROVADO", "N.C APROVADO"].includes(novoStatus) ? (EXCECOES_VALOR_VENDEDOR[os.vendedor.toUpperCase()] || VALOR_PADRAO_VENDA) : 0;
        return { ...os, status: novoStatus, financeiro, valor };
      }
      return os;
    }));
  };

  // ==========================================
  // 🔎 FILTRAGEM DOS DADOS (MEMÓRIA)
  // ==========================================
  const dadosFiltrados = useMemo(() => {
    return listaOS.filter(os => {
      if (!contasSelecionadas.includes(os.conta)) return false;
      
      const matchUsuario = os.usuario_cadastro.toLowerCase().includes(filtroUsuario.toLowerCase());
      const matchVendedor = os.vendedor.toLowerCase().includes(filtroVendedor.toLowerCase());
      const matchAuditoria = os.status.toLowerCase().includes(filtroAuditoria.toLowerCase());
      const matchCidade = filtroCidade === "Todos" || os.cidade === filtroCidade;

      return matchUsuario && matchVendedor && matchAuditoria && matchCidade;
    });
  }, [listaOS, contasSelecionadas, filtroUsuario, filtroVendedor, filtroAuditoria, filtroCidade]);

  // DIAGNÓSTICO METRICS
  const diagnostico = useMemo(() => {
    const total = dadosFiltrados.length;
    const aprovados = dadosFiltrados.filter(os => ["APROVADO", "N.C APROVADO"].includes(os.status)).length;
    const reprovados = dadosFiltrados.filter(os => os.status === "REPROVADO").length;
    const pendentes = dadosFiltrados.filter(os => ["-", ""].includes(os.status)).length;
    const totalPagar = dadosFiltrados.reduce((acc, os) => acc + os.valor, 0);

    return { total, aprovados, reprovados, pendentes, totalPagar };
  }, [dadosFiltrados]);

  // AGRUPAMENTO POR CIDADE (Para divisão dinâmica em tela igual ao original)
  const dadosPorCidade = useMemo(() => {
    const grupos: Record<string, OrdemServico[]> = {};
    dadosFiltrados.forEach(os => {
      if (!grupos[os.cidade]) grupos[os.cidade] = [];
      grupos[os.cidade].push(os);
    });
    return grupos;
  }, [dadosFiltrados]);

  return (
    <div className="p-6 text-slate-100 bg-slate-950 min-h-screen flex flex-col lg:flex-row gap-6">
      
      {/* 🔎 SIDEBAR DE FILTROS BASE */}
      <div className="w-full lg:w-64 bg-slate-900 p-4 rounded-xl border border-slate-800 h-fit space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Filter size={18} className="text-emerald-400" />
          <h2 className="font-semibold text-sm">Filtros Base</h2>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Contas / Empresas</label>
          <div className="space-y-2">
            {["amazonet", "mania"].map(conta => (
              <label key={conta} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                <input 
                  type="checkbox"
                  checked={contasSelecionadas.includes(conta)}
                  onChange={(e) => {
                    if (e.target.checked) setContasSelecionadas([...contasSelecionadas, conta]);
                    else setContasSelecionadas(contasSelecionadas.filter(c => c !== conta));
                  }}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                {conta}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Data Início</label>
          <input 
            type="date" 
            value={dataInicio} 
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Data Fim</label>
          <input 
            type="date" 
            value={dataFim} 
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button 
          onClick={() => setDadosCarregados(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Layers size={14} />
          Gerar Relatório
        </button>
      </div>

      {/* PAINEL CENTRAL PRINCIPAL */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📋 Fechamento Vendas – Autônomos
          </h1>
          <p className="text-xs text-slate-400 mt-1">Gestão, auditoria e divisão analítica de faturamento por lote geográfico.</p>
        </div>

        {/* 🎯 FILTROS DE REFINAMENTO EM TELA */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Buscar Usuário Abertura</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Ex: admin"
                value={filtroUsuario} 
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="w-full pl-9 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Buscar Vendedor / Técnico</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Ex: CARLOS"
                value={filtroVendedor} 
                onChange={(e) => setFiltroVendedor(e.target.value)}
                className="w-full pl-9 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Status Auditoria</label>
            <select
              value={filtroAuditoria}
              onChange={(e) => setFiltroAuditoria(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todos os Status</option>
              <option value="APROVADO">APROVADO</option>
              <option value="N.C APROVADO">N.C APROVADO</option>
              <option value="REPROVADO">REPROVADO</option>
              <option value="-">PENDENTE</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Filtrar por Cidade</label>
            <select
              value={filtroCidade}
              onChange={(e) => setFiltroCidade(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Todos">Todas as Cidades</option>
              <option value="Santarém">Santarém</option>
              <option value="Manaus">Manaus</option>
              <option value="NÃO DEFINIDO">NÃO DEFINIDO</option>
            </select>
          </div>
        </div>

        {/* 🔍 DIAGNÓSTICO DE DADOS METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-slate-400 text-xs">Total Registros</p>
            <p className="text-xl font-bold mt-1 text-slate-100">{diagnostico.total}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl border-l-4 border-l-emerald-500">
            <p className="text-slate-400 text-xs">✅ Aprovados</p>
            <p className="text-xl font-bold mt-1 text-emerald-400">{diagnostico.aprovados}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl border-l-4 border-l-rose-500">
            <p className="text-slate-400 text-xs">❌ Reprovados</p>
            <p className="text-xl font-bold mt-1 text-rose-400">{diagnostico.reprovados}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl border-l-4 border-l-amber-500">
            <p className="text-slate-400 text-xs">⏳ Pendentes</p>
            <p className="text-xl font-bold mt-1 text-amber-400">{diagnostico.pendentes}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-850 col-span-2 lg:col-span-1">
            <p className="text-slate-400 text-xs">💰 Total Geral a Pagar</p>
            <p className="text-xl font-bold mt-1 text-white">R$ {diagnostico.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* ⚠️ ALERTA DE REGISTROS PENDENTES DE AUDITORIA MANUAL */}
        {diagnostico.pendentes > 0 && (
          <div className="bg-amber-950/40 border border-amber-800 text-amber-200 p-3 rounded-lg flex items-center gap-2 text-xs">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
            <span>Há <strong>{diagnostico.pendentes} OS pendentes</strong> de auditoria manual. Ajuste os status diretamente na coluna "Status" de cada tabela abaixo.</span>
          </div>
        )}

        {/* ➕ INSERÇÃO MANUAL DE OS EXPANDER */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowManual(!showManual)}
            className="w-full p-4 flex items-center justify-between text-left text-sm font-semibold hover:bg-slate-850 transition-colors"
          >
            <span className="flex items-center gap-2"><Plus size={16} className="text-emerald-500"/> Adicionar OS Manualmente</span>
            <span className="text-xs text-slate-400">{showManual ? "Fechar" : "Expandir"}</span>
          </button>
          
          {showManual && (
            <form onSubmit={handleAdicionarOSManual} className="p-4 bg-slate-950/50 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Código do Cliente</label>
                <input type="text" required value={manualCliente} onChange={e => setManualCliente(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Número da OS</label>
                <input type="text" required value={manualOS} onChange={e => setManualOS(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Status de Auditoria</label>
                <select required value={manualStatus} onChange={e => setManualStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm focus:outline-none focus:border-emerald-500">
                  <option value="">Selecione...</option>
                  <option value="APROVADO">APROVADO</option>
                  <option value="N.C APROVADO">N.C APROVADO</option>
                  <option value="REPROVADO">REPROVADO</option>
                </select>
              </div>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-4 rounded transition-colors h-[34px]">
                Confirmar Inserção
              </button>
            </form>
          )}
        </div>

        <hr className="border-slate-800" />

        {/* ── SEPARAÇÃO DINÂMICA POR CIDADE ── */}
        <div className="space-y-8">
          {Object.keys(dadosPorCidade).length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhum registro localizado para os filtros atuais.</div>
          ) : (
            Object.entries(dadosPorCidade).map(([cidade, ordens]) => {
              const totalCidade = ordens.reduce((acc, curr) => acc + curr.valor, 0);
              
              // Resumo interno por vendedor na cidade
              const resumoVendedor = ordens.reduce((acc: any, curr) => {
                if (["APROVADO", "N.C APROVADO"].includes(curr.status)) {
                  if (!acc[curr.vendedor]) acc[curr.vendedor] = { qtd: 0, valor: 0 };
                  acc[curr.vendedor].qtd += 1;
                  acc[curr.vendedor].valor += curr.valor;
                }
                return acc;
              }, {});

              return (
                <div key={cidade} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        🏙️ Cidade: <span className="text-emerald-400">{cidade}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Lote geográfico mapeado</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-sm">
                      <span className="text-slate-400">Total da Cidade: </span>
                      <strong className="text-white">R$ {totalCidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>

                  {/* TABELA DE DETALHAMENTO DE OS */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">📋 Detalhamento das Ordens de Serviço</h4>
                    <div className="overflow-x-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        
                        <thead>
                          <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                            <th className="p-2.5">Cód Cliente</th>
                            <th className="p-2.5">Cód O.S</th>
                            <th className="p-2.5">Vendedor / Técnico</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Financeiro</th>
                            <th className="p-2.5 text-right">Valor</th>
                          </tr>
                          </thead>
                        </table>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <tbody className="divide-y divide-slate-800 text-slate-300 bg-slate-900/50">
                              {ordens.map((os) => (
                                <tr key={os.numero_ordem_servico} className="hover:bg-slate-850/50 transition-colors">
                                  <td className="p-2.5 w-[15%] font-mono">{os.codigo_cliente}</td>
                                  <td className="p-2.5 w-[15%] font-mono">{os.numero_ordem_servico}</td>
                                  <td className="p-2.5 w-[30%] truncate max-w-[200px]" title={os.vendedor}>
                                    {os.vendedor} {os.isManual && <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">Manual</span>}
                                  </td>
                                  <td className="p-2.5 w-[20%]">
                                    <select
                                      value={os.status}
                                      onChange={(e) => handleAlterarStatusTabela(os.numero_ordem_servico, e.target.value)}
                                      className={`bg-slate-950 text-xs border rounded p-1 focus:outline-none ${
                                        os.status === 'APROVADO' ? 'text-emerald-400 border-emerald-900' :
                                        os.status === 'N.C APROVADO' ? 'text-cyan-400 border-cyan-900' :
                                        os.status === 'REPROVADO' ? 'text-rose-400 border-rose-900' : 'text-amber-400 border-amber-900'
                                      }`}
                                    >
                                      <option value="-">PENDENTE</option>
                                      <option value="APROVADO">APROVADO</option>
                                      <option value="N.C APROVADO">N.C APROVADO</option>
                                      <option value="REPROVADO">REPROVADO</option>
                                    </select>
                                  </td>
                                  <td className="p-2.5 w-[10%]">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${os.financeiro === 'PAGO' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900' : 'bg-slate-800 text-slate-400'}`}>
                                      {os.financeiro}
                                    </span>
                                  </td>
                                  <td className="p-2.5 w-[10%] text-right font-mono text-slate-200">
                                    R$ {os.valor.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      
                    </div>
                  </div>

                  {/* RESUMO POR VENDEDOR NA CIDADE */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">👥 Resumo de Vendas por Vendedor ({cidade})</h4>
                    {Object.keys(resumoVendedor).length === 0 ? (
                      <div className="bg-slate-950/40 p-3 rounded-lg text-amber-400 text-xs border border-amber-950">
                        Sem faturamentos aprovados para gerar pagamentos em {cidade}.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-800 rounded-lg">
                        <table className="w-full text-left border-collapse text-xs bg-slate-950/30">
                          <thead>
                            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                              <th className="p-2">Vendedor</th>
                              <th className="p-2 text-center">Quantidade Vendas</th>
                              <th className="p-2 text-right">Valor a Receber</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-200">
                            {Object.entries(resumoVendedor).map(([vend, info]: any) => (
                              <tr key={vend} className="hover:bg-slate-850/30">
                                <td className="p-2 font-medium">{vend}</td>
                                <td className="p-2 text-center font-mono">{info.qtd}</td>
                                <td className="p-2 text-right font-mono text-emerald-400 font-semibold">R$ {info.valor.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* BOTÕES DE EXPORTAÇÃO (Simulando Triggers para os PDFs em Python) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <button 
                      onClick={() => alert(`Gerando Relatório de Vendas PDF para ${cidade}...`)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileText size={14} className="text-red-400" />
                      Baixar Relatório {cidade}
                    </button>
                    <button 
                      onClick={() => alert(`Gerando Recibo de Vendas PDF para ${cidade}...`)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={14} className="text-cyan-400" />
                      Baixar Recibo {cidade}
                    </button>
                    <button 
                      onClick={() => alert(`Gerando Relatório Analítico PDF para ${cidade}...`)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <DollarSign size={14} className="text-emerald-400" />
                      Relatório Analítico {cidade}
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}