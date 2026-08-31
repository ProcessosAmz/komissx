import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Cpu,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth.ts";
import type { AuthModule } from "@/types/auth";
import { Logo } from "../common/logo";
import { SidebarItem } from "./SidebarItem";

interface NavigationItem {
  label: string;
  path: string;
  modulo: AuthModule;
  icon: typeof LayoutDashboard;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    modulo: "producao",
    icon: LayoutDashboard,
  },
  {
    label: "Fechamentos",
    path: "/admin/fechamentos",
    modulo: "fechamento",
    icon: CalendarCheck,
  },
  {
    label: "Academy",
    path: "/admin/academy",
    modulo: "academy",
    icon: GraduationCap,
  },
  {
    label: "Configurações",
    path: "/admin/configuracoes",
    modulo: "configuracoes",
    icon: Cpu,
  },
];

const STORAGE_SIDEBAR = "komissx-sidebar-recolhido";

function lerSidebarRecolhido(): boolean {
  try {
    return localStorage.getItem(STORAGE_SIDEBAR) === "1";
  } catch {
    return false;
  }
}

export function Sidebar() {
  const { user, logout, canAccessModule } = useAuth();
  const [recolhido, setRecolhido] = useState(lerSidebarRecolhido);

  const visibleItems = NAVIGATION_ITEMS.filter((item) =>
    canAccessModule(item.modulo),
  );

  const alternarSidebar = () => {
    setRecolhido((atual) => {
      const proximo = !atual;
      try {
        localStorage.setItem(STORAGE_SIDEBAR, proximo ? "1" : "0");
      } catch {
        return proximo;
      }
      return proximo;
    });
  };

  return (
    <aside
      className={`app-sidebar shrink-0 bg-[#060a13]/70 border-r border-slate-900 flex flex-col justify-between transition-[width] duration-200 ${
        recolhido ? "w-[72px]" : "w-64"
      }`}
    >
      <div>
        <div
          className={`h-16 flex items-center border-b border-slate-800 ${
            recolhido ? "justify-center px-2" : "justify-between px-3"
          }`}
        >
          {recolhido ? null : <Logo className="h-18 w-auto min-w-0" />}
          <button
            type="button"
            onClick={alternarSidebar}
            title={recolhido ? "Abrir menu" : "Fechar menu"}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-900/60 hover:text-slate-200"
          >
            {recolhido ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {user && !recolhido ? (
          <div className="p-3 mx-3 my-2 rounded-lg bg-slate-900/60 border border-slate-800/40">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user.name}
            </p>
            <span className="inline-block text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded mt-1">
              Perfil: {user.role}
            </span>
          </div>
        ) : null}

        <nav className="p-3 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={recolhido ? item.label : undefined}
              className={({ isActive }) =>
                `block rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
                } ${recolhido ? "px-0 py-2.5" : "px-3 py-2.5"}`
              }
            >
              {({ isActive }) => (
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive}
                  recolhido={recolhido}
                />
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-900/60">
        <button
          type="button"
          onClick={() => void logout()}
          title="Sair do sistema"
          className={`w-full flex items-center rounded-lg text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer ${
            recolhido ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {recolhido ? null : "Sair do Sistema"}
        </button>
      </div>
    </aside>
  );
}
