import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  recolhido?: boolean;
}

export function SidebarItem({
  icon: Icon,
  label,
  isActive,
  recolhido = false,
}: SidebarItemProps) {
  return (
    <div
      className={`flex items-center w-full ${recolhido ? "justify-center" : "gap-3"}`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
          isActive
            ? "text-indigo-400"
            : "text-slate-500 group-hover:text-slate-400"
        }`}
      />
      {recolhido ? null : <span className="truncate">{label}</span>}
    </div>
  );
}
