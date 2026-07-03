import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DefaultLayout() {
  return (
    <div className="min-h-screen w-full bg-[#030712] flex text-slate-100 antialiased font-sans">
      
      {/* SIDEBAR FIXA NA ESQUERDA */}
      <aside className="w-64 border-r border-slate-900/80 bg-[#090d16]/40 hidden md:block shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* BLOCO DIREITO: Ocupa o restante do espaço da tela */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER SUPERIOR (Com Avatar à Direita) */}
        <Header />

        {/* SUB-HEADER: Breadcrumb à esquerda e Tenant à direita */}
        <section className="h-11 border-b border-slate-900/60 bg-[#060a12]/30 px-6 flex items-center justify-between text-xs">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span>Admin</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-200">Motor de Regras</span>
          </div>

          {/* Tenant ID Informado */}
          <div className="flex items-center gap-1.5 bg-[#090d16] border border-slate-800/60 px-2 py-0.5 rounded text-[10px] font-mono text-indigo-400">
            <span className="h-1 w-1 rounded-full bg-indigo-500" />
            amazonet
          </div>
        </section>

        {/* ÁREA DE CONTEÚDO DIVIDIDA: Conteúdo Principal vs. Widget Lateral */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          
          {/* CONTEÚDO PRINCIPAL (Dinamizado pelas rotas com o Outlet) */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <Outlet />
          </main>

          {/* WIDGET LATERAL DIREITO (Alertas rápidos, status do motor ou sumário) */}
          <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-900/60 bg-[#050910]/10 p-6 shrink-0">
            <div className="sticky top-24 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mecanismo de Regras
              </h4>
              <div className="bg-[#0b0f19]/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Versão ativa</span>
                  <span className="font-mono text-slate-200">v2.4</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status do Motor</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Operacional
                  </span>
                </div>
              </div>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}