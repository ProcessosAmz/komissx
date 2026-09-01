import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Wrench, 
  FileSpreadsheet, 
  ArrowRight, 
  ShieldAlert, 
  TrendingUp, 
  Briefcase, 
  DollarSign 
} from 'lucide-react';

export default function HubFechamentos() {
  const navigate = useNavigate();
  
  const [showSemanalOptions, setShowSemanalOptions] = useState(false);
  const [showMensalOptions, setShowMensalOptions] = useState(false);

  return (
    <div className="min-h-screen bg-[#070a13] p-6 lg:p-8 text-slate-100 antialiased">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            HUB de Fechamentos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Selecione o módulo operacional para fechamento, processamento de regras e extração de relatorios.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`bg-[#0b0f19]/60 border rounded-2xl p-6 transition-all backdrop-blur-sm flex flex-col justify-between min-h-[260px] ${showSemanalOptions ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-800/80 hover:border-slate-700'}`}>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit">
                <Wrench className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Fechamento Semanal</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Auditoria de ordens de serviço, validação e cálculo automatizado de repasses semanais para técnicos, retiradas e autônomos.
                </p>
              </div>
            </div>

            {!showSemanalOptions ? (
              <button
                onClick={() => setShowSemanalOptions(true)}
                className="mt-6 flex items-center justify-center gap-2 w-full bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold py-2.5 rounded-xl transition-all text-slate-300"
              >
                Acessar Fechamento Semanal <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            ) : (
              <div className="mt-6 grid grid-cols-3 gap-2 animate-fadeIn">
                <button
                  onClick={() => navigate('/admin/fechamentos/semanal/tecnicos')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 text-center"
                >
                  <Wrench className="h-4 w-4" />
                  Técnicos
                </button>
                <button
                  onClick={() => navigate('/admin/fechamentos/semanal/retirada')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all text-center"
                >
                  <ShieldAlert className="h-4 w-4 text-indigo-400" />
                  Retirada
                </button>
                <button
                  onClick={() => navigate('/admin/fechamentos/semanal/autonomos')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all text-center"
                >
                  <Users className="h-4 w-4 text-indigo-400" />
                  Autônomos
                </button>
              </div>
            )}
          </div>

          <div className={`bg-[#0b0f19]/60 border rounded-2xl p-6 transition-all backdrop-blur-sm flex flex-col justify-between min-h-[260px] ${showMensalOptions ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-800/80 hover:border-slate-700'}`}>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
                <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Fechamento Mensal</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Comissões de vendas, metas batidas por consultores, produção técnica, contratos de canais PJ e conciliações de cobrança.
                </p>
              </div>
            </div>

            {!showMensalOptions ? (
              <button
                onClick={() => setShowMensalOptions(true)}
                className="mt-6 flex items-center justify-center gap-2 w-full bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold py-2.5 rounded-xl transition-all text-slate-300"
              >
                Acessar Fechamento Mensal <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-2 animate-fadeIn">
                <button
                  onClick={() => navigate('/admin/fechamentos/mensal/comercial')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 text-center"
                >
                  <TrendingUp className="h-4 w-4" />
                  Comercial
                </button>
                <button
                  onClick={() => navigate('/admin/fechamentos/mensal/producao')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all text-center"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  Produção Técnico
                </button>
                <button
                  onClick={() => navigate('/admin/fechamentos/mensal/comercial-pj')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all text-center"
                >
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                  Comercial PJ
                </button>
                <button
                  onClick={() => navigate('/admin/fechamentos/mensal/cobranca')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all text-center"
                >
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  Cobrança
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}