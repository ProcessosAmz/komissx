import { useMemo, useState } from "react";
import { ArrowRightLeft, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useUsers } from "@/hooks/useUsers";
import { HierarquiaNode } from "@/types/cargo";
import { flattenUsers, getIniciais, isLiderRole } from "@/utils/hierarquia";
import { montarPayloadMoverUsuarioApi } from "@/utils/moverUsuario";
import { MoverUsuarioDialog } from "./moverUsuarioDialog";

type VincularLideresProps = {
  supervisorId: string;
  lideres: HierarquiaNode[];
  readOnly?: boolean;
};

export function VincularLideres({
  supervisorId,
  lideres,
  readOnly = false,
}: VincularLideresProps) {
  const { data: usersResponse } = useUsers();
  const updateUser = useUpdateUser();
  const [busca, setBusca] = useState("");
  const [liderParaMover, setLiderParaMover] = useState<HierarquiaNode | null>(
    null,
  );

  const idsVinculados = useMemo(
    () => new Set(lideres.map((lider) => lider.id)),
    [lideres],
  );

  const buscaNormalizada = busca.trim().toLowerCase();

  const lideresDisponiveis = flattenUsers(usersResponse?.data ?? []).filter(
    (usuario) => {
      if (!isLiderRole(usuario.roleName)) {
        return false;
      }

      if (idsVinculados.has(usuario.id) || usuario.supervisorId === supervisorId) {
        return false;
      }

      if (!buscaNormalizada) {
        return true;
      }

      return (
        usuario.name.toLowerCase().includes(buscaNormalizada) ||
        usuario.email.toLowerCase().includes(buscaNormalizada)
      );
    },
  );

  const handleVincular = async (usuarioId: string) => {
    if (readOnly) {
      return;
    }

    const usuario = flattenUsers(usersResponse?.data ?? []).find(
      (item) => item.id === usuarioId,
    );

    if (!usuario) {
      return;
    }

    await updateUser.mutateAsync({
      userId: usuario.id,
      payload: montarPayloadMoverUsuarioApi(usuario, supervisorId),
    });
    setBusca("");
  };

  return (
    <div className="space-y-3 pt-1">
      <h5 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        Líderes deste supervisor
      </h5>

      <div className="space-y-2">
        {lideres.length === 0 ? (
          <p className="text-[11px] text-slate-500">Nenhum líder vinculado.</p>
        ) : (
          lideres.map((lider) => (
            <div
              key={lider.id}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#05080f] px-2.5 py-2"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-slate-700/50 text-slate-300 text-[10px] font-bold">
                  {getIniciais(lider.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {lider.nome}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{lider.email}</p>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] font-bold bg-slate-700/60 text-slate-300 border-slate-600/50"
              >
                LIDER
              </Badge>
              {!readOnly ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-slate-500 hover:text-indigo-400"
                  onClick={() => setLiderParaMover(lider)}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          ))
        )}
      </div>

      {!readOnly ? (
        <>
          <h5 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase pt-2">
            Vincular líder existente
          </h5>

          <Input
            placeholder="Buscar líder para vincular..."
            className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {lideresDisponiveis.map((lider) => (
              <div
                key={lider.id}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#05080f] px-2.5 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-100 truncate">
                    {lider.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{lider.email}</p>
                </div>
                <Button
                  size="sm"
                  className="h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] gap-1"
                  disabled={updateUser.isPending}
                  onClick={() => handleVincular(lider.id)}
                >
                  <Plus className="h-3 w-3" />
                  Vincular
                </Button>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <MoverUsuarioDialog
        aberto={Boolean(liderParaMover)}
        usuario={liderParaMover}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            setLiderParaMover(null);
          }
        }}
      />
    </div>
  );
}