import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useUsers } from "@/hooks/useUsers";
import type { HierarquiaNode } from "@/types/cargo";
import {
  listarDestinosMove,
  montarPayloadMoverUsuario,
  rotuloDestinoMove,
} from "@/utils/moverUsuario";

const selectClassName =
  "w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold";

type MoverUsuarioDialogProps = {
  aberto: boolean;
  usuario: HierarquiaNode | null;
  onAbertoChange: (aberto: boolean) => void;
};

export function MoverUsuarioDialog({
  aberto,
  usuario,
  onAbertoChange,
}: MoverUsuarioDialogProps) {
  const updateUser = useUpdateUser();
  const { data: usersResponse } = useUsers();
  const [destinoId, setDestinoId] = useState("");

  const destinos = usuario
    ? listarDestinosMove(usuario, usersResponse?.data ?? [])
    : [];
  const rotulo = usuario ? rotuloDestinoMove(usuario) : "responsável";

  const handleAbertoChange = (proximoAberto: boolean) => {
    if (!proximoAberto) {
      setDestinoId("");
    }
    onAbertoChange(proximoAberto);
  };

  const handleConfirmar = async () => {
    if (!usuario || !destinoId) {
      return;
    }

    await updateUser.mutateAsync({
      userId: usuario.id,
      payload: montarPayloadMoverUsuario(usuario, destinoId),
    });
    handleAbertoChange(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={handleAbertoChange}>
      <DialogContent className="bg-[#090d16] border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mover usuário</DialogTitle>
          <DialogDescription className="text-slate-400">
            {usuario
              ? `Escolha o novo ${rotulo} para ${usuario.nome}. Os liderados deste usuário permanecem com ele.`
              : "Selecione um usuário."}
          </DialogDescription>
        </DialogHeader>

        <select
          className={selectClassName}
          value={destinoId}
          onChange={(event) => setDestinoId(event.target.value)}
          disabled={!usuario}
        >
          <option value="">Selecione</option>
          {destinos.map((destino) => (
            <option key={destino.id} value={destino.id}>
              {destino.name}
            </option>
          ))}
        </select>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleAbertoChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-500"
            disabled={!destinoId || updateUser.isPending}
            onClick={handleConfirmar}
          >
            {updateUser.isPending ? "Movendo..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}