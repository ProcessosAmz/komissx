import { Building2, Users, CalendarDays, CalendarClock, Download, ShieldCheck, LucideIcon } from "lucide-react";


interface ModuloItem {
    path: string;
    label: string;
    icon: LucideIcon;
  }
  
export const MODULOS_NEGOCIO_LIST: ModuloItem[] = [
    { path: "empresas", label: "Empresas (Amazonet/Mania)", icon: Building2 },
    { path: "equipes", label: "Equipes e Hierarquias", icon: Users },
    { path: "semanal", label: "Relatório Semanal", icon: CalendarDays },
    { path: "mensal", label: "Relatório Mensal", icon: CalendarClock },
    { path: "acessos", label: "Controle de Acessos", icon: ShieldCheck },
    { path: "backup", label: "Exportar / Importar", icon: Download },
];