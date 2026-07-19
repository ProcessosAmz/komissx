// features/fechamentos/semanal/tecnicos/components/TecnicosTable.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { TecnicoRowViewModel, StatusAuditoria } from '../../../types';

interface TableProps {
  dados: TecnicoRowViewModel[];
  onAlterarStatus: (id: string, s: StatusAuditoria) => void;
  onExcluir: (id: string) => void;
}

export const TecnicosTable: React.FC<TableProps> = ({ dados, onAlterarStatus, onExcluir }) => (
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
        {dados.map((os) => (
          <tr key={os.id} className="hover:bg-slate-900/30 transition-colors">
            <td className="px-4 py-3 text-slate-300 font-medium">{os.codigo_cliente}</td>
            <td className="px-4 py-3 font-mono text-indigo-400">{os.numero_ordem_servico}</td>
            <td className="px-4 py-3 text-slate-300">{os.usuario_fechamento_limpo}</td>
            <td className="px-4 py-3 text-center">
              <select
                value={os.status_auditoria}
                onChange={(e) => onAlterarStatus(os.id, e.target.value as StatusAuditoria)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="PENDENTE">PENDENTE</option>
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
              R$ {os.valor_a_pagar.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-center">
              <button onClick={() => onExcluir(os.id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);