// src/pages/Fechamentos/tecnico/index.tsx
import React, { useState, useMemo } from 'react';
import { tecnicoService } from '../Fechamentos/tecnico/tecnicoService';
import { OrdemServico, RegrasGlobais } from '../Fechamentos/tecnico/types';
import { ArrowLeft, Trash2, CheckCircle2, XCircle, Search, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importa o JSON mapeado diretamente do ecossistema
import mockRulesJson from "@/data/rules.json";

export default function FechamentoTecnico() {
  const navigate = useNavigate();
  
  // Transforma o JSON estruturado em uma referência imutável tipada
  const regrasConfiguradas = useMemo<RegrasGlobais>(() => {
    return mockRulesJson as RegrasGlobais;
  }, []);

  const [dadosBrutos, setDadosBrutos] = useState<OrdemServico[]>(() => tecnicoService.getMockData());
  const [filtroTecnico, setFiltroTecnico] = useState<string>('TODOS');
  const [buscaOS, setBuscaOS] = useState<string>('');

  // Reprocessa os dados dinamicamente se as regras ou a lista bruta mudarem
  const dadosDeduplicados = useMemo(() => {
    return tecnicoService.processarEDeduplicar(dadosBrutos, regrasConfiguradas);
  }, [dadosBrutos, regrasConfiguradas]);

  const listaTecnicos = useMemo(() => {
    return ['TODOS', ...Array.from(new Set(dadosBrutos.map(d => d.usuario_fechamento_limpo)))];
  }, [dadosBrutos]);

  const dadosFiltrados = useMemo(() => {
    return dadosDeduplicados.filter(os => {
      const matchTecnico = filtroTecnico === 'TODOS' || os.usuario_fechamento_limpo === filtroTecnico;
      const matchBusca = os.numero_ordem_servico.includes(buscaOS) || os.codigo_cliente.includes(buscaOS);
      return matchTecnico && matchBusca;
    });
  }, [dadosDeduplicados, filtroTecnico, buscaOS]);

  const resumo = useMemo(() => {
    return dadosFiltrados.reduce((acc, os) => {
      acc.totalOS += 1;
      if (os.status_financeiro === 'PAGO') {
        acc.aprovadas += 1;
        acc.totalReceber += os.valor_a_pagar || 0;
      } else {
        acc.reprovadas += 1;
      }
      return acc;
    }, { totalReceber: 0, totalOS: 0, aprovadas: 0, reprovadas: 0 });
  }, [dadosFiltrados]);

  const handleExcluir = (id: string) => {
    setDadosBrutos(prev => prev.filter(item => item.id !== id));
  };

  const handleAlterarStatus = (id: string, novoStatus: OrdemServico['status_auditoria']) => {
    setDadosBrutos(prev => prev.map(item => item.id === id ? { ...item, status_auditoria: novoStatus } : item));
  };

  return (
    <div className="min-h-screen bg-[#070a13] p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Topo de controle */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/admin/fechamentos')} // 👈 Rota exata do seu HUB de Fechamentos
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transform transition-transform group-hover:-translate-x-0.5" />
            Voltar ao HUB
          </button>
          
          <button 
            onClick={() => navigate('/admin/motor-de-regras/semanal')}
            className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10"
          >
            <Sliders className="h-3.5 w-3.5" />
            Configurar Repasses Semanais
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Fechamento Técnico</h1>
          <p className="text-sm text-slate-400 mt-1">Valores herdados em tempo real a partir das definições do Painel Administrativo.</p>
        </div>

        {/* Notificação de Validação */}
        <div className="bg-indigo-950/20 border border-indigo-500/20 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-indigo-400">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Motor ativo sincronizando {Object.keys(regrasConfiguradas?.fechamento_semanal?.tecnicos_terceirizados || {}).length} tabelas de técnicos terceirizados.</span>
          </div>
        </div>

        {/* Filtros */}
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

        {/* KPIs */}
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

        {/* Datagrid */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b0f19]/20">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Ordem Serviço</th>
                <th className="px-4 py-3">Técnico Encontrado</th>
                <th className="px-4 py-3 text-center">Status Auditoria</th>
                <th className="px-4 py-3 text-center">Fin.</th>
                <th className="px-4 py-3 text-right">Valor Repasse</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dadosFiltrados.map((os) => (
                <tr key={os.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3 text-slate-300 font-medium">{os.codigo_cliente}</td>
                  <td className="px-4 py-3 font-mono text-indigo-400">{os.numero_ordem_servico}</td>
                  <td className="px-4 py-3 text-slate-300">{os.usuario_fechamento_limpo}</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={os.status_auditoria}
                      onChange={(e) => handleAlterarStatus(os.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="">PENDENTE</option>
                      <option value="APROVADO">APROVADO</option>
                      <option value="NC APROVADO">NC APROVADO</option>
                      <option value="REPROVADO">REPROVADO</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${os.status_financeiro === 'PAGO' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {os.status_financeiro}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-200">
                    R$ {os.valor_a_pagar?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleExcluir(os.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}