import { Bell } from "lucide-react";

import { useAuth } from "@/hooks/useAuth.ts";

export function Header() {
  const { user } = useAuth();

  const initials = (user?.name ?? "AG")
    .split(" ")
    .map((namePart) => namePart[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-[#090d16]/60 border-b border-slate-900 px-6 flex items-center justify-between shrink-0 backdrop-blur">
      <span className="text-sm font-semibold tracking-wide text-white font-mono">
        Amazonet<span className="text-[24px] text-indigo-400 font-sans">Hub</span>
      </span>
      <div className="flex items-center gap-4">
        <button className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900/50">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 pl-4 border-l border-slate-900">
          <div className="text-right hidden sm:block">
            <p className="text-[16px] font-medium text-slate-200 leading-none">
              {user?.name ?? "—"}
            </p>
            <p className="text-[13px] text-slate-500 font-mono mt-1">
              {user?.email ?? "—"}
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-xs">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}