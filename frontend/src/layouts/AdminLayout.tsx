// src/layouts/AdminLayout.tsx
import React from 'react';
import { ArrowLeft, Sliders } from 'lucide-react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mapeamento dinâmico para o botão de configurações baseado na rota atual
  // Assim, cada tela pode apontar para sua respectiva configuração se necessário
  const getConfigRoute = () => {
    if (location.pathname.includes('/semanal/tecnicos')) {
      return {
        route: '/admin/motor-de-regras/semanal',
        label: 'Configurar Repasses Semanais'
      };
    }
    // Exemplo para outra tela futura:
    if (location.pathname.includes('/mensal/cobranca')) {
      return {
        route: '/admin/motor-de-regras/mensal',
        label: 'Configurar Regras Mensais'
      };
    }
    return null;
  };

  const config = getConfigRoute();

  return (
    <div className="min-h-screen bg-[#070a13] p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Topo unificado que aparecerá em TODAS as telas do Admin */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/fechamentos')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group bg-slate-900/50 border border-slate-800/80 px-3 py-2 rounded-xl"
          >
            <ArrowLeft className="h-3.5 w-3.5 transform transition-transform group-hover:-translate-x-0.5" />
            Voltar ao HUB
          </button>

          {config && (
            <button
              onClick={() => navigate(config.route)}
              className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10"
            >
              <Sliders className="h-3.5 w-3.5" />
              {config.label}
            </button>
          )}
        </div>

        {/* O Outlet renderiza a página interna atual (Ex: FechamentoTecnico) */}
        <Outlet />

      </div>
    </div>
  );
}