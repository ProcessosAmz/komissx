import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfiguracoesContent } from "@/components/painel-configuracoes/configuracoes-content";
import { ModulosNegocioSidebar } from "@/components/painel-configuracoes/modulos/negocio-sidebar";
import mockRulesJson from "@/data/rules.json";

// TODO : REMOVE MOCK DATA AFTER IMPLEMENTATION
const mockUsersInit = [
  { id: 1, name: "Operador Fechamento A", email: "operador.a@empresa.com", telas_fechamento: ["mensal_comercial"] },
  { id: 2, name: "Operador Fechamento B", email: "operador.b@empresa.com", telas_fechamento: ["semanal_tecnico"] }
];

export default function PainelConfiguracoes() {
  const [globalRules, setGlobalRules] = useState(mockRulesJson);
  const [globalUsers, setGlobalUsers] = useState(mockUsersInit);

  const handleSalvarConfiguracoes = (novosDados: any) => setGlobalRules(novosDados);
  const handleUpdateUsers = (novosUsuarios: any) => setGlobalUsers(novosUsuarios);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Configuração do Ecossistema"
        subtitle="Gerencie parâmetros estruturais, regras de relatórios semanais/mensais e comissões por grupos."
      />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <ModulosNegocioSidebar />
        <ConfiguracoesContent
          context={{
            globalRules,
            onSalvar: handleSalvarConfiguracoes,
            users: globalUsers,
            onUpdateUsers: handleUpdateUsers
          }}
        />
      </div>
    </div>
  );
}