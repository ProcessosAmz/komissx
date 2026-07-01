import { Logo } from '../common/Logo';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
  tenantName?: string;
  userName?: string;
  userRole?: string;
}

export function Header({
  tenantName = 'amazonet',
  userName = 'Admin Geral',
  userRole,
}: HeaderProps) {
  return (
    <header className="w-full h-16 bg-[#090d16]/80 border-b border-slate-900 px-4 sm:px-6 backdrop-blur-md sticky top-0 z-50">
      {/* Grade estrutural dividida em 3 colunas de tamanhos iguais */}
      <div className="grid grid-cols-3 h-full items-center w-full">
        
        {/* COLUNA 1: Logo Pequena alinhada totalmente à esquerda */}
        <div className="flex justify-start">
          <Logo className="h-3 w-auto" showText={true} />
        </div>

        {/* COLUNA 2: Título Centralizado */}
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-xs sm:text-sm font-medium tracking-wide text-slate-200 uppercase tracking-wider">
            Plataforma de Comissões
          </h2>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 mt-0.5">
            Regras de Negócio para Empresas de Telecom e Finanças
          </span>
        </div>

        {/* COLUNA 3: Usuário alinhado totalmente à direita */}
        <div className="flex justify-end items-center gap-3">
          <button className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-900/50 cursor-pointer hidden sm:block">
            <Bell className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="text-right hidden xs:block">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-300 leading-none">
                {userName}
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                {userRole ?? tenantName}
              </p>
            </div>
            <div className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <User className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
