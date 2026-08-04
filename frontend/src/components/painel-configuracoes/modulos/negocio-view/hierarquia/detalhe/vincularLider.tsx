import { Plus, Unlink } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { HierarquiaNode } from "@/types/cargo";
import { cargoBadgeClass, getIniciais } from "@/utils/hierarquia";

type VincularLideresProps = {
  lideres: HierarquiaNode[];
};

export function VincularLideres({ lideres }: VincularLideresProps) {
  return (
    <div className="space-y-3 pt-1">
      <h5 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        Vincular líderes existentes
      </h5>

      <Input
        label="Buscar líder para vincular..."
        placeholder="Buscar líder para vincular..."
        className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
      />

      <div className="space-y-2">
        {lideres.map((lider) => (
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
              <p className="text-[10px] text-slate-500 truncate">
                {lider.email}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-[9px] font-bold ${cargoBadgeClass("LIDER")}`}
            >
              LIDER
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500 hover:text-red-400"
            >
              <Unlink className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Button className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-2">
        <Plus className="h-4 w-4" />
        Adicionar novo líder neste supervisor
      </Button>
    </div>
  );
}