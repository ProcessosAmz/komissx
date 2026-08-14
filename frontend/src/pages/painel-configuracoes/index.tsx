import { useState } from "react";
import { ConfiguracoesContent } from "@/components/painel-configuracoes/configuracoes-content";
import { ModulosNegocioSidebar } from "@/components/painel-configuracoes/modulos/negocio-sidebar";
import { Header } from "@/components/painel-configuracoes/header";
import { NovoSupervisorDialog } from "@/components/painel-configuracoes/create-supervisor-dialog";

export default function PainelConfiguracoes() {
  const [globalRules, setGlobalRules] = useState();
  const [globalUsers, setGlobalUsers] = useState();
  const [dialogNovoSupervisorAberto, setDialogNovoSupervisorAberto] = useState(false);

  const handleSalvarConfiguracoes = (novosDados: any) => setGlobalRules(novosDados);
  const handleUpdateUsers = (novosUsuarios: any) => setGlobalUsers(novosUsuarios);

  return (
    <div className="space-y-6">
      <Header onNovoSupervisor={() => setDialogNovoSupervisorAberto(true)} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <ModulosNegocioSidebar />
        <ConfiguracoesContent
          context={{
            globalRules,
            onSalvar: handleSalvarConfiguracoes,
            users: globalUsers,
            onUpdateUsers: handleUpdateUsers,
          }}
        />
      </div>

      <NovoSupervisorDialog
        open={dialogNovoSupervisorAberto}
        onOpenChange={setDialogNovoSupervisorAberto}
      />
    </div>
  );
}