import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Cpu, Users, CalendarCheck, GraduationCap, LogOut } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "../common/Logo";
import { useAuth, PERMISSOES } from "@/stores/auth.store";

export function Sidebar() {
  const navigate = useNavigate();

  // 🎯 SOLUÇÃO DO LOOP: Seletores atômicos evitam a criação de novas referências de objetos
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const allItems = [
    { label: "Dashboard", path: "/admin/dashboard", modulo: "producao" as const, icon: LayoutDashboard },
    { label: "Fechamentos", path: "/admin/fechamentos", modulo: "fechamento" as const, icon: CalendarCheck },
    { label: "Academy", path: "/admin/academy", modulo: "academy" as const, icon: GraduationCap },
    { label: "Configurações", path: "/admin/configuracoes", modulo: "configuracoes" as const, icon: Cpu }
    
    
  ];

  // Filtra os itens do menu com base nas permissões reais do perfil logado
  const visibleItems = user ? allItems.filter(item => PERMISSOES[item.modulo](user.role)) : [];

  const handleLogout = () => {
    logout();
    navigate("/autenticacao", { replace: true });
  };

  return (
    <aside className="app-sidebar w-64 shrink-0 bg-[#060a13]/70 border-r border-slate-900 flex flex-col justify-between">
      <div>
        <div className="h-16 px-6 flex items-center gap-1 border-b border-slate-800">
          <Logo className="h-18 w-auto" />
        </div>

        {/* Identificador Visual do Perfil Atual (Ótimo para debug/testes) */}
        {user && (
          <div className="p-3 mx-3 my-2 rounded-lg bg-slate-900/60 border border-slate-800/40">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
            <span className="inline-block text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded mt-1">
              Perfil: {user.role}
            </span>
          </div>
        )}

        <nav className="p-3 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg transition-all duration-150 ${isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
                }`
              }
            >
              {({ isActive }) => <SidebarItem icon={item.icon} label={item.label} isActive={isActive} />}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-900/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}