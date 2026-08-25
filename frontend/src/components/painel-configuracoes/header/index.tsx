import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onNovoUsuario?: () => void;
}

export function Header({ onNovoUsuario }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Painel de Configuração do Ecossistema
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gerencie parâmetros estruturais, regras de relatórios semanais/mensais e
          comissões por grupos.
        </p>
      </div>

      {onNovoUsuario ? (
        <Button
          type="button"
          className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-2"
          onClick={onNovoUsuario}
        >
          <Plus className="h-4 w-4" />
          Novo usuário
        </Button>
      ) : null}
    </div>
  );
}