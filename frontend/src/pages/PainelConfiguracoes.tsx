import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Building2, Users, CalendarDays, CalendarClock, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import mockRulesJson from "@/data/rules.json";

export default function PainelConfiguracoes() {
  // O Estado Raiz do JSON vive aqui e pode ser compartilhado via React Context 
  // ou passado via o "context" do Outlet do React Router
  const [globalRules, setGlobalRules] = useState(mockRulesJson);

  const handleSalvarConfiguracoes = (novosDados: any) => {
    setGlobalRules(novosDados);
    console.log("JSON pronto para o NestJS:", novosDados);
  };

  const menuItems = [
    { path: "empresas", label: "Empresas (Amazonet/Mania)", icon: Building2 },
    { path: "equipes", label: "Equipes e Hierarquias", icon: Users },
    { path: "semanal", label: "Relatório Semanal", icon: CalendarDays },
    { path: "mensal", label: "Relatório Mensal", icon: CalendarClock },
    { path: "backup", label: "Exportar / Importar", icon: Download },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Configuração do Ecossistema"
        subtitle="Gerencie parâmetros estruturais, regras de relatórios e comissões."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* NAVEGAÇÃO (QUEM DIZ ONDE IR AGORA É A URL) */}
        <aside className="xl:col-span-3 bg-[#090d16] border border-slate-800 rounded-3xl p-4 space-y-2">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Módulos do Negócio
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15"
                      : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </aside>

        {/* CONTEÚDO DINÂMICO (O OUTLET RENDERIZA O MÓDULO DA SUB-ROTA ATUAL) */}
        <main className="xl:col-span-9 space-y-6">
          <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6">
            
            {/* O React Router injeta o componente filho aqui e envia o estado global via context */}
            <Outlet context={{ globalRules, onSalvar: handleSalvarConfiguracoes }} />
            
          </div>
        </main>
      </div>
    </div>
  );
}