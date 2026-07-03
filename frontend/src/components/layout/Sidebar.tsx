import { NavLink } from 'react-router-dom';
import { Cpu, Users, CalendarCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { SidebarItem } from './SidebarItem';

export function Sidebar() {
  // Lista de rotas do menu mapeadas diretamente para as páginas da imagem_bf73e4.png
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard', // Direciona para o seu Dashboard.tsx
      icon: LayoutDashboard,
    },
    {
      label: 'Motor de Regras',
      path: '/admin/motor-de-regras', // Direciona para o seu Admin.tsx
      icon: Cpu,
    },
    {
      label: 'Equipes',
      path: '/admin/equipes', // Direciona para o seu Equipes.tsx
      icon: Users,
    },
    {
      label: 'Fechamentos',
      path: '/admin/fechamentos', // Direciona para o seu Fechamentos.tsx
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-[#060a13]/60">
      
      {/* CORPO SUPERIOR: Marca + Links */}
      <div className="space-y-7">
        {/* Identificação interna do Painel */}
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-600/20">
            K
          </div>
          <span className="text-sm font-semibold tracking-wide text-white font-mono">
            KOMISSX <span className="text-[10px] text-indigo-400 font-sans">SaaS</span>
          </span>
        </div>

        {/* Links de Navegação */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Reaproveita o comportamento visual do SidebarItem interno */}
                  <SidebarItem 
                    icon={item.icon} 
                    label={item.label} 
                    isActive={isActive} 
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* BASE DA SIDEBAR: Ação de Sair do Sistema */}
      <div className="pt-4 border-t border-slate-900/60">
        <NavLink
          to="/autenticacao"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sair do Sistema</span>
        </NavLink>
      </div>

    </div>
  );
}