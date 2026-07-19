// features/fechamentos/semanal/tecnicos/hooks/useTecnicos.ts
import { useState, useEffect, useMemo } from 'react';
import { ConfigService } from '../../../../../config/ConfigService';
import { TecnicoService } from '../services/tecnicoService';
import { OrdemServico, TecnicoRowViewModel, ResumoFechamentoDTO, StatusAuditoria } from '../../../types';

export const useTecnicos = (filtroTecnico: string, buscaOS: string) => {
  const [dadosBrutos, setDadosBrutos] = useState<OrdemServico[]>([]);
  const [semanalRules, setSemanalRules] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Carga inicial do Core ConfigService
  useEffect(() => {
    async function inicializarModulo() {
      try {
        const config = await ConfigService.getInstance().loadConfigurations();
        setSemanalRules(config.fechamento_semanal);
        
        // Simulação de chamada HTTP GET futuro da API
        const mockResponse = [
          { id: '1', codigo_cliente: '10023', numero_ordem_servico: '85960', usuario_fechamento: 'LOBATO_AMZ', usuario_fechamento_limpo: 'LOBATO', usuario_abertura: 'SISTEMA', tipo_ordem_servico: 'INSTALAÇÃO FTTH', data_termino_executado: '2026-07-10', status_auditoria: 'APROVADO' as const, conta: 'amazonet' as const },
          { id: '2', codigo_cliente: '10023', numero_ordem_servico: '85960', usuario_fechamento: 'LOBATO_AMZ', usuario_fechamento_limpo: 'LOBATO', usuario_abertura: 'SISTEMA', tipo_ordem_servico: 'INSTALAÇÃO FTTH', data_termino_executado: '2026-07-09', status_auditoria: 'REPROVADO' as const, conta: 'amazonet' as const },
          { id: '3', codigo_cliente: '20455', numero_ordem_servico: '85961', usuario_fechamento: 'GABRIEL_MANIA', usuario_fechamento_limpo: 'GABRIEL', usuario_abertura: 'ATENDIMENTO', tipo_ordem_servico: 'MANUTENÇÃO DE REDE', data_termino_executado: '2026-07-11', status_auditoria: 'NC APROVADO' as const, conta: 'mania' as const },
        ];
        setDadosBrutos(mockResponse);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    inicializarModulo();
  }, []);

  const dadosDeduplicados = useMemo(() => {
    if (!semanalRules) return [];
    return TecnicoService.processarEDeduplicar(dadosBrutos, semanalRules);
  }, [dadosBrutos, semanalRules]);

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

  const resumo = useMemo<ResumoFechamentoDTO>(() => {
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

  const handleAlterarStatus = (id: string, novoStatus: StatusAuditoria) => {
    const registroOriginal = dadosBrutos.find(item => item.id === id);
    if (!registroOriginal) return;

    // Regra de Negócio Crítica: Alteração após aprovação bloqueada na UI
    const statusBloqueados: StatusAuditoria[] = ['APROVADO', 'NC APROVADO'];
    if (statusBloqueados.includes(registroOriginal.status_auditoria)) {
      alert(`Bloqueio de Segurança: O registro ${registroOriginal.numero_ordem_servico} já possui liquidação financeira pendente/aprovada. Use a Auditoria com validação de Líder.`);
      return; 
    }

    setDadosBrutos(prev => prev.map(item => item.id === id ? { ...item, status_auditoria: novoStatus } : item));
  };

  return { dadosFiltrados, listaTecnicos, resumo, loading, totalSincronizados: Object.keys(semanalRules?.tecnicos_terceirizados || {}).length, handleExcluir, handleAlterarStatus };
};