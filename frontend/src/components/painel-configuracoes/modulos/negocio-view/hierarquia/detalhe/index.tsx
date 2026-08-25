import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightLeft, Trash2, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NovoUsuarioDialog } from "@/components/painel-configuracoes/create-user-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import { HierarquiaNode } from "@/types/cargo";
import { cargoBadgeClass, getIniciais } from "@/utils/hierarquia";
import { VincularLideres } from "./vincularLider";
import { FormularioColaborador } from "./formulario";
import { MoverUsuarioDialog } from "./moverUsuarioDialog";

const TEXTO_CONFIRMACAO_EXCLUSAO = "desejo excluir o usuario";

type DetalheColaboradorProps = {
  selecionado: HierarquiaNode | null;
  onDeleted?: () => void;
};

export function DetalheColaborador({
  selecionado,
  onDeleted,
}: DetalheColaboradorProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const deleteUser = useDeleteUser();
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [moverAberto, setMoverAberto] = useState(false);
  const [novoUsuarioAberto, setNovoUsuarioAberto] = useState(false);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");

  const lideresVinculados =
    selecionado?.cargo === "SUPERVISOR"
      ? (selecionado.children ?? []).filter((filho) => filho.cargo === "LIDER")
      : [];

  const podeMover =
    Boolean(selecionado) && selecionado?.cargo !== "SUPERVISOR" && isAdmin;

  const podeAdicionar =
    isAdmin &&
    (selecionado?.cargo === "SUPERVISOR" || selecionado?.cargo === "LIDER");

  const confirmacaoValida =
    textoConfirmacao.trim().toLowerCase() === TEXTO_CONFIRMACAO_EXCLUSAO;

  const handleAbrirConfirmacao = () => {
    setTextoConfirmacao("");
    setConfirmacaoAberta(true);
  };

  const handleFecharConfirmacao = (aberto: boolean) => {
    if (!aberto) {
      setTextoConfirmacao("");
    }
    setConfirmacaoAberta(aberto);
  };

  const handleConfirmarRemocao = async () => {
    if (!selecionado || !confirmacaoValida) {
      return;
    }

    await deleteUser.mutateAsync(selecionado.id);
    setTextoConfirmacao("");
    setConfirmacaoAberta(false);
    onDeleted?.();
  };

  return (
    <Card className="xl:col-span-7 bg-[#090d16] border-slate-800 rounded-2xl w-1/2">
      <CardContent className="p-4 space-y-5">
        <AnimatePresence mode="wait">
          {!selecionado ? (
            <motion.p
              key="vazio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="text-sm text-slate-500"
            >
              Selecione um colaborador na árvore.
            </motion.p>
          ) : (
            <motion.div
              key={selecionado.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-indigo-600/20 text-indigo-300 text-xs font-bold">
                      {getIniciais(selecionado.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        {selecionado.nome}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${cargoBadgeClass(selecionado.cargo)}`}
                      >
                        {selecionado.cargo}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {selecionado.email}
                    </p>
                  </div>
                </div>

                {isAdmin ? (
                  <div className="flex items-center gap-1 shrink-0">
                    {podeAdicionar ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-1.5"
                        onClick={() => setNovoUsuarioAberto(true)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Adicionar
                      </Button>
                    ) : null}
                    {podeMover ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-1.5"
                        onClick={() => setMoverAberto(true)}
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Mover
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                      onClick={handleAbrirConfirmacao}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </Button>
                  </div>
                ) : null}
              </div>

              <FormularioColaborador
                selecionado={selecionado}
                readOnly={!isAdmin}
              />

              {selecionado.cargo === "SUPERVISOR" ? (
                <VincularLideres
                  supervisorId={selecionado.id}
                  lideres={lideresVinculados}
                  readOnly={!isAdmin}
                />
              ) : null}

              <NovoUsuarioDialog
                open={novoUsuarioAberto}
                onOpenChange={setNovoUsuarioAberto}
                responsavel={
                  podeAdicionar &&
                  (selecionado.cargo === "SUPERVISOR" ||
                    selecionado.cargo === "LIDER")
                    ? {
                        id: selecionado.id,
                        nome: selecionado.nome,
                        cargo: selecionado.cargo,
                        empresaId: selecionado.empresaId,
                        unidadeId: selecionado.unidadeId,
                      }
                    : null
                }
              />

              <MoverUsuarioDialog
                aberto={moverAberto}
                usuario={selecionado}
                onAbertoChange={setMoverAberto}
              />

              <Dialog
                open={confirmacaoAberta}
                onOpenChange={handleFecharConfirmacao}
              >
                <DialogContent className="bg-[#090d16] border-slate-800 text-slate-100 sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Remover usuário</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      {`Para remover ${selecionado.nome}, digite exatamente: ${TEXTO_CONFIRMACAO_EXCLUSAO}`}
                    </DialogDescription>
                  </DialogHeader>

                  <Input
                    value={textoConfirmacao}
                    onChange={(event) =>
                      setTextoConfirmacao(event.target.value)
                    }
                    placeholder={TEXTO_CONFIRMACAO_EXCLUSAO}
                    className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs text-slate-100"
                    autoComplete="off"
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleFecharConfirmacao(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-600 hover:bg-red-500"
                      disabled={deleteUser.isPending || !confirmacaoValida}
                      onClick={handleConfirmarRemocao}
                    >
                      {deleteUser.isPending
                        ? "Removendo..."
                        : "Confirmar remoção"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}