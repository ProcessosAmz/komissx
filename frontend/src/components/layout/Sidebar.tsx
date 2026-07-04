import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Cpu, Users, CalendarCheck, LogOut } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "../common/Logo";
import { useAuth } from "@/stores/auth.store";

export function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);

  const items = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Configurações", path: "/admin/motor-de-regras", icon: Cpu },
    { label: "Equipes", path: "/admin/equipes", icon: Users },
    { label: "Fechamentos", path: "/admin/fechamentos", icon: CalendarCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate("/autenticacao", { replace: true });
  };

  return (
    <aside className="app-sidebar w-50 shrink-0 bg-[#060a13]/70 border-r border-slate-900 flex flex-col">
      <div className="h-16 px-10 flex items-center gap-1 border-b border-slate-800">
        <Logo className="h-full" />
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => (
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
