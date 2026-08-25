import { useState } from "react";
import { ConfiguracoesContent } from "@/components/painel-configuracoes/configuracoes-content";
import { ModulosNegocioSidebar } from "@/components/painel-configuracoes/modulos/negocio-sidebar";
import { Header } from "@/components/painel-configuracoes/header";
import { NovoUsuarioDialog } from "@/components/painel-configuracoes/create-user-dialog";
import { useAuth } from "@/hooks/useAuth";

export default function PainelConfiguracoes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [globalRules, setGlobalRules] = useState();
  const [globalUsers, setGlobalUsers] = useState();
  const [dialogNovoUsuarioAberto, setDialogNovoUsuarioAberto] = useState(false);

  const handleSalvarConfiguracoes = (novosDados: any) => setGlobalRules(novosDados);
  const handleUpdateUsers = (novosUsuarios: any) => setGlobalUsers(novosUsuarios);

  return (
    <div className="space-y-6">
      <Header
        onNovoUsuario={
          isAdmin ? () => setDialogNovoUsuarioAberto(true) : undefined
        }
      />

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

      {isAdmin ? (
        <NovoUsuarioDialog
          open={dialogNovoUsuarioAberto}
          onOpenChange={setDialogNovoUsuarioAberto}
        />
      ) : null}
    </div>
  );
}