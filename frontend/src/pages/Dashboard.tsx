import { motion } from 'framer-motion';
import { ArrowUpRight, DollarSign, Users, AlertCircle, FileSpreadsheet } from 'lucide-react';

// Dados fictícios simulando a resposta da API para a empresa 'amazonet'
const MOCK_METRICAS = [
  {
    id: '1',
    titulo: 'Volume Líquido Processado',
    valor: 'R$ 1.240.500,00',
    subtexto: '+12% em relação ao mês anterior',
    icone: DollarSign,
    corIcone: 'text-indigo-400',
  },
  {
    id: '2',
    titulo: 'Comissões Projetadas',
    valor: 'R$ 48.210,50',
    subtexto: 'Ciclo corrente (Julho/2026)',
    icone: ArrowUpRight,
    corIcone: 'text-emerald-400',
  },
  {
    id: '3',
    titulo: 'Beneficiários Ativos',
    valor: '4 Colaboradores',
    subtexto: 'Vendedores e canais ativos',
    icone: Users,
    corIcone: 'text-blue-400',
  },
];

const MOCK_TRANSACOES = [
  { id: 'Instalação Técnica', colaborador: 'Ketlyn Athan', valorBruto: 'R$ 15.000,00', comissao: 'R$ 750,00', status: 'Processado' },
  { id: 'Vendas Autônomos', colaborador: 'Matheus Raposo', valorBruto: 'R$ 8.500,00', comissao: 'R$ 425,00', status: 'Processado' },
  { id: 'Retirada', colaborador: 'Paulo Victor', valorBruto: 'R$ 22.100,00', comissao: 'R$ 1.105,00', status: 'Pendente' },
  { id: 'Indeque e Ganhe', colaborador: 'Junior César', valorBruto: 'R$ 4.200,00', comissao: 'R$ 84,00', status: 'Processado' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      
      {/* SEÇÃO DE BOAS-VINDAS E AÇÕES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Painel de Comissão
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Visão geral de apurações para <span className="text-indigo-400 font-mono font-medium">Empresas</span>
          </p>
        </div>

        {/* Botão de Ação Primária: Ingestão de CSV */}
        <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-[0.99]">
          <FileSpreadsheet className="h-4 w-4" />
          Importar Vendas (CSV)
        </button>
      </div>

      {/* PAINEL DE CARDS (MÉTRICAS COGNITIVAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MOCK_METRICAS.map((metrica, index) => {
          const Icone = metrica.icone;
          return (
            <motion.div
              key={metrica.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[#0b0f19]/40 border border-slate-800/60 rounded-xl p-5 backdrop-blur-sm"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-normal text-slate-400 tracking-wide">
                  {metrica.titulo}
                </span>
                <div className={`p-2 bg-slate-900/50 border border-slate-800 rounded-lg ${metrica.corIcone}`}>
                  <Icone className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  {metrica.valor}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  {metrica.subtexto}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SEÇÃO DA TABELA DE TRANSAÇÕES */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-[#0b0f19]/40 border border-slate-800/60 rounded-xl overflow-hidden backdrop-blur-sm"
      >
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-200">
            Lançamentos Recentes do Período
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Mostrando {MOCK_TRANSACOES.length} registros
          </span>
        </div>

        {/* Wrapper Responsivo para Rolagem Horizontal */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/60 bg-slate-900/20 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">ID Transação</th>
                <th className="px-6 py-3 font-medium">Colaborador</th>
                <th className="px-6 py-3 font-medium text-right">Valor Bruto</th>
                <th className="px-6 py-3 font-medium text-right">Comissão Devida</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs sm:text-sm">
              {MOCK_TRANSACOES.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors text-slate-300">
                  <td className="px-6 py-3.5 font-mono text-[12px] text-slate-400">{tx.id}</td>
                  <td className="px-6 py-3.5 font-medium text-white">{tx.colaborador}</td>
                  <td className="px-6 py-3.5 text-right font-mono">{tx.valorBruto}</td>
                  <td className="px-6 py-3.5 text-right font-mono font-medium text-emerald-400">{tx.comissao}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                      tx.status === 'Processado' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}