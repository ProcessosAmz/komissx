import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HierarquiaNode } from "@/types/cargo";
import { cargoBadgeClass, getIniciais } from "@/utils/hierarquia";
import { VincularLideres } from "./vincularLider";
import { FormularioColaborador } from "./formulario";

type DetalheColaboradorProps = {
  selecionado: HierarquiaNode | null;
};

export function DetalheColaborador({ selecionado }: DetalheColaboradorProps) {
  const lideresVinculados =
    selecionado?.cargo === "SUPERVISOR"
      ? (selecionado.children ?? []).filter((filho) => filho.cargo === "LIDER")
      : [];

  return (
    <Card className="xl:col-span-7 bg-[#090d16] border-slate-800 rounded-2xl w-1/2">
      <CardContent className="p-4 space-y-5">
        {!selecionado ? (
          <p className="text-sm text-slate-500">
            Selecione um colaborador na árvore.
          </p>
        ) : (
          <>
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

              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </Button>
            </div>

            <FormularioColaborador selecionado={selecionado} />

            {selecionado.cargo === "SUPERVISOR" ? (
              <VincularLideres lideres={lideresVinculados} />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}