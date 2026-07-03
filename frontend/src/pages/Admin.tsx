import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, ToggleLeft, Sliders } from 'lucide-react';

export default function Admin() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho Interno da Página */}
      <div className="border-b border-slate-900 pb-4">
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-400" />
          Configuração do Motor de Regras
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie e parametrize as diretrizes matemáticas de comissionamento global.
        </p>
      </div>

      {/* Cards de Parâmetros Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0b0f19]/40 border border-slate-800/60 rounded-xl p-5 backdrop-blur-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              Taxa Base de Operação
            </h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              Ativo
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Porcentagem fixa aplicada sobre o faturamento líquido inicial antes dos aceleradores de meta.
          </p>
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              defaultValue="5.0%" 
              className="w-24 rounded-md bg-[#111726]/60 border border-slate-800/80 px-3 py-1.5 text-sm font-mono text-white text-center outline-none focus:border-indigo-600"
            />
            <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer">
              Atualizar Taxa
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0b0f19]/40 border border-slate-800/60 rounded-xl p-5 backdrop-blur-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              Trava de Segurança (Chargeback)
            </h3>
            <ToggleLeft className="h-6 w-6 text-slate-600 cursor-pointer hover:text-slate-500" />
          </div>
          <p className="text-xs text-slate-400">
            Estornar automaticamente comissões de faturas que entrarem em inadimplência superior a 45 dias.
          </p>
        </motion.div>
      </div>
    </div>
  );
}