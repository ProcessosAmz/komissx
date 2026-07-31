import { PageHeader } from "@/components/layout/PageHeader";
// import { ModulosNegocioSidebar } from "@/features/configuracoes/components/ModulosNegocioSidebar";
// import { ConfiguracoesContent } from "@/features/configuracoes/components/ConfiguracoesContent";

export default function PainelConfiguracoes() {
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