import { Bell, User, Menu } from 'lucide-react';
import { Logo } from '../common/Logo';

export function Header() {
  return (
    <header className="w-full h-16 bg-[#090d16]/40 border-b border-slate-900/80 px-6 flex items-center justify-between shrink-0">
      
      {/* Lado Esquerdo: Botão Mobile ou Logo Indicativa */}
      <div className="flex items-center gap-3">
        <button className="p-1.5 text-slate-400 hover:text-slate-200 block md:hidden rounded-lg hover:bg-slate-900/50 cursor-pointer">
          <Menu className="h-5 w-5" />
        </button>
        <Logo />
      </div>

      {/* Lado Direito: Notificações + Bloco de Avatar do Usuário */}
      <div className="flex items-center gap-4">
        <button className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-900/50 cursor-pointer">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-900">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-medium text-slate-200 leading-none">
              Admin Geral
            </p>
            <p className="text-[9px] text-slate-500 font-mono mt-1">
              admin@komissx.com
            </p>
          </div>
          {/* Avatar estruturado exatamente como na sua pasta UI */}
          <div className="h-8 w-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-xs shadow-inner">
            AG
          </div>
        </div>
      </div>

    </header>
  );
}