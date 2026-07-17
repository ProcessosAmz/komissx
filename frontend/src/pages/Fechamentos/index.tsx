import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, FileSpreadsheet, Sliders, ArrowRight } from 'lucide-react';

export default function HubFechamentos() {
  const navigate = useNavigate();
  const [showTecnicoOptions, setShowTecnicoOptions] = useState(false);

  return (
    <div className="min-h-screen bg-[#070a13] p-6 lg:p-8 text-slate-100 antialiased">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            HUB de Fechamentos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Selecione o módulo operacional para auditoria, processamento de regras e conciliação financeira.
          </p>
        </div>

        {/* Grid de Módulos */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Card: Fechamento Técnico */}
          <div className={`bg-[#0b0f19]/60 border rounded-2xl p-6 transition-all backdrop-blur-sm flex flex-col justify-between min-h-[220px] ${showTecnicoOptions ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-800/80 hover:border-slate-700'}`}>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit">
                {/* Ícone corrigido aqui 👇 */}
                <Wrench className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Fechamento Técnico</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Auditoria de ordens de serviço deduplicadas, validação de glosas e cálculo automatizado de repasses para técnicos terceirizados.
                </p>
              </div>
            </div>

            {/* Sub-menu expansível interno para seleção */}
            {!showTecnicoOptions ? (
              <button
                onClick={() => setShowTecnicoOptions(true)}
                className="mt-6 flex items-center justify-center gap-2 w-full bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold py-2.5 rounded-xl transition-all text-slate-300"
              >
                Acessar Fechamento <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-2 animate-fadeIn">
                <button
                  onClick={() => navigate('/admin/fechamentos/tecnico')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10"
                >
                  <Users className="h-4 w-4" />
                  Ir para Técnico
                </button>
                <button
                  onClick={() => navigate('/admin/motor-de-regras/semanal')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  Configurar Regras
                </button>
              </div>
            )}
          </div>

          {/* Card Modelo: Fechamento Comercial (Exemplo de Próxima Tela) */}
          <div className="bg-[#0b0f19]/30 border border-slate-900 opacity-60 rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl w-fit">
                <FileSpreadsheet className="h-6 w-6 text-emerald-500/60" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-400">Fechamento Comercial</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Análise de comissões de vendas, metas batidas por consultores e bonificações recorrentes contratadas.
                </p>
              </div>
            </div>
            <button disabled className="mt-6 w-full bg-slate-950 border border-slate-900 text-xs font-semibold py-2.5 rounded-xl text-slate-600 cursor-not-allowed">
              Módulo Indisponível
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}