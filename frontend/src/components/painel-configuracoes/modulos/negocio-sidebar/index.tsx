import { NavLink } from "react-router-dom";
import { MODULOS_NEGOCIO_LIST } from "./utils/modulosNegocioList";

export function ModulosNegocioSidebar() {
  return (
    <aside className="xl:col-span-3 bg-[#090d16] border border-slate-800 rounded-3xl p-4 space-y-2">
      <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
        Módulos do Negócio
      </div>

      {MODULOS_NEGOCIO_LIST.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
              isActive
                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15"
                : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </aside>
  );
}