// src/pages/Fechamentos/tecnico/tecnicoService.ts
import { OrdemServico, RegrasGlobais } from './types';

export const tecnicoService = {
  // Varre a chave exata do seu JSON dinâmico
  calcularValorDinamico(nome: string, regras: RegrasGlobais | undefined): number {
    const terceirizados = regras?.fechamento_semanal?.tecnicos_terceirizados;
    if (!terceirizados) return 0;
    
    const nomeUpper = nome.toUpperCase().trim();
    
    for (const [chave, valor] of Object.entries(terceirizados)) {
      if (nomeUpper.includes(chave.toUpperCase())) {
        return valor;
      }
    }
    return 0; // Fallback caso não encontre correspondência
  },

  // Deduplicação por prioridade idêntica ao fluxo Python do Metabase
  processarEDeduplicar(dados: OrdemServico[], regras: RegrasGlobais | undefined): OrdemServico[] {
    const getPrioridade = (status: string) => {
      const s = status.toUpperCase();
      if (['APROVADO', 'NC APROVADO', 'N.C APROVADO'].includes(s)) return 2;
      if (s === 'REPROVADO') return 0;
      return 1;
    };

    const ordenados = [...dados].sort((a, b) => {
      if (a.codigo_cliente !== b.codigo_cliente) return a.codigo_cliente.localeCompare(b.codigo_cliente);
      if (a.numero_ordem_servico !== b.numero_ordem_servico) return a.numero_ordem_servico.localeCompare(b.numero_ordem_servico);
      
      const prioridadeA = getPrioridade(a.status_auditoria);
      const prioridadeB = getPrioridade(b.status_auditoria);
      if (prioridadeA !== prioridadeB) return prioridadeB - prioridadeA;

      return new Date(b.data_termino_executado).getTime() - new Date(a.data_termino_executado).getTime();
    });

    const visitados = new Set<string>();
    const deduplicados: OrdemServico[] = [];

    for (const os of ordenados) {
      const chaveUnica = `${os.codigo_cliente}_${os.numero_ordem_servico}`;
      if (!visitados.has(chaveUnica)) {
        visitados.add(chaveUnica);

        const statusFin = getPrioridade(os.status_auditoria) === 2 ? 'PAGO' : '-';
        // Chamada dinâmica usando a árvore injetada
        const vBase = this.calcularValorDinamico(os.usuario_fechamento_limpo, regras);
        
        deduplicados.push({
          ...os,
          status_financeiro: statusFin as 'PAGO' | '-',
          valor_base: vBase,
          valor_a_pagar: statusFin === 'PAGO' ? vBase : 0
        });
      }
    }

    return deduplicados;
  },

  getMockData(): OrdemServico[] {
    return [
      { id: '1', codigo_cliente: '10023', numero_ordem_servico: '85960', usuario_fechamento: 'LOBATO_AMZ', usuario_fechamento_limpo: 'LOBATO', usuario_abertura: 'SISTEMA', tipo_ordem_servico: 'INSTALAÇÃO FTTH', data_termino_executado: '2026-07-10', status_auditoria: 'APROVADO', conta: 'amazonet' },
      { id: '2', codigo_cliente: '10023', numero_ordem_servico: '85960', usuario_fechamento: 'LOBATO_AMZ', usuario_fechamento_limpo: 'LOBATO', usuario_abertura: 'SISTEMA', tipo_ordem_servico: 'INSTALAÇÃO FTTH', data_termino_executado: '2026-07-09', status_auditoria: 'REPROVADO', conta: 'amazonet' },
      { id: '3', codigo_cliente: '20455', numero_ordem_servico: '85961', usuario_fechamento: 'GABRIEL_MANIA', usuario_fechamento_limpo: 'GABRIEL', usuario_abertura: 'ATENDIMENTO', tipo_ordem_servico: 'MANUTENÇÃO DE REDE', data_termino_executado: '2026-07-11', status_auditoria: 'NC APROVADO', conta: 'mania' },
    ];
  }
};