import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Building2, Users, CalendarDays, CalendarClock, Download, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import mockRulesJson from "@/data/rules.json";

// Mock inicial de usuários para evitar que o módulo de acessos inicie vazio
const mockUsersInit = [
  { id: 1, name: "Operador Fechamento A", email: "operador.a@empresa.com", telas_fechamento: ["mensal_comercial"] },
  { id: 2, name: "Operador Fechamento B", email: "operador.b@empresa.com", telas_fechamento: ["semanal_tecnico"] }
];

export default function PainelConfiguracoes() {
  // 1. Estados raiz centralizados
  const [globalRules, setGlobalRules] = useState(mockRulesJson);
  const [globalUsers, setGlobalUsers] = useState(mockUsersInit);

  // 2. Disparadores de salvamento e sincronização
  const handleSalvarConfiguracoes = (novosDados: any) => {
    setGlobalRules(novosDados);
    console.log("JSON de Regras sincronizado no pai:", novosDados);
  };

  const handleUpdateUsers = (novosUsuarios: any) => {
    setGlobalUsers(novosUsuarios);
    console.log("Lista de Permissões de Usuários sincronizada no pai:", novosUsuarios);
  };

  const menuItems = [
    { path: "empresas", label: "Empresas (Amazonet/Mania)", icon: Building2 },
    { path: "equipes", label: "Equipes e Hierarquias", icon: Users },
    { path: "semanal", label: "Relatório Semanal", icon: CalendarDays },
    { path: "mensal", label: "Relatório Mensal", icon: CalendarClock },
    { path: "acessos", label: "Controle de Acessos", icon: ShieldCheck },
    { path: "backup", label: "Exportar / Importar", icon: Download },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Configuração do Ecossistema"
        subtitle="Gerencie parâmetros estruturais, regras de relatórios semanais/mensais e comissões por grupos."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* NAVEGAÇÃO LATERAL */}
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
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${isActive
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

        {/* CONTEÚDO DINÂMICO DOS SUB-MÓDULOS */}
        <main className="xl:col-span-9 space-y-6">
          <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6">
            {/* Passando tanto as regras quanto os usuários pelo contexto do Outlet */}
            <Outlet
              context={{
                globalRules,
                onSalvar: handleSalvarConfiguracoes,
                users: globalUsers,
                onUpdateUsers: handleUpdateUsers
              }}
            />
          </div>
        </main>

      </div>
    </div>
  );
}