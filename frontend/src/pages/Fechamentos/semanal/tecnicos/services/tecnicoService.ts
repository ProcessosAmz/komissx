// features/fechamentos/semanal/tecnicos/services/tecnicoService.ts
import { OrdemServico, TecnicoRowViewModel, FechamentoSemanalRules } from '../../../types';

export class TecnicoService {
  
  private static getPrioridadeAuditoria(status: string): number {
    const s = status.toUpperCase().trim();
    if (['APROVADO', 'NC APROVADO', 'N.C APROVADO'].includes(s)) return 2;
    if (s === 'REPROVADO') return 0;
    return 1; // PENDENTE
  }

  public static calcularValorRepasse(nome: string, rules: FechamentoSemanalRules): number {
    const terceirizados = rules?.tecnicos_terceirizados;
    if (!terceirizados) return 0;

    const nomeUpper = nome.toUpperCase().trim();
    for (const [chave, valor] of Object.entries(terceirizados)) {
      if (nomeUpper.includes(chave.toUpperCase())) {
        return valor;
      }
    }
    return 0; 
  }

  public static processarEDeduplicar(
    dados: OrdemServico[], 
    rules: FechamentoSemanalRules
  ): TecnicoRowViewModel[] {
    
    // Regra Fixa de Negócio: Ordenação estrutural por Cliente, OS, Prioridade e Data Limite
    const ordenados = [...dados].sort((a, b) => {
      if (a.codigo_cliente !== b.codigo_cliente) return a.codigo_cliente.localeCompare(b.codigo_cliente);
      if (a.numero_ordem_servico !== b.numero_ordem_servico) return a.numero_ordem_servico.localeCompare(b.numero_ordem_servico);

      const prioridadeA = this.getPrioridadeAuditoria(a.status_auditoria);
      const prioridadeB = this.getPrioridadeAuditoria(b.status_auditoria);
      if (prioridadeA !== prioridadeB) return prioridadeB - prioridadeA;

      return new Date(b.data_termino_executado).getTime() - new Date(a.data_termino_executado).getTime();
    });

    const visitados = new Set<string>();
    const deduplicados: TecnicoRowViewModel[] = [];

    for (const os of ordenados) {
        const chaveUnica = os.codigo_cliente;
      if (!visitados.has(chaveUnica)) {
        visitados.add(chaveUnica);

        const isAprovada = this.getPrioridadeAuditoria(os.status_auditoria) === 2;
        const statusFin = isAprovada ? 'PAGO' : '-';
        const vBase = this.calcularValorRepasse(
          `${os.usuario_fechamento_limpo} ${os.usuario_fechamento}`,
          rules,
        );

        deduplicados.push({
          ...os,
          status_auditoria: os.status_auditoria || 'PENDENTE',
          status_financeiro: statusFin,
          valor_base: vBase,
          valor_a_pagar: statusFin === 'PAGO' ? vBase : 0
        });
      }
    }

    return deduplicados;
  }
}