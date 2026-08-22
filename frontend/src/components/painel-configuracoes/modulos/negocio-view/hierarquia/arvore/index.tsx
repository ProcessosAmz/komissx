import { Card, CardContent } from "@/components/ui/card";
import { HierarquiaNode } from "@/types/cargo";
import { TreeNodeItem } from "./treeNodeItem";

type ArvoreHierarquicaProps = {
  nos: HierarquiaNode[];
  totalRegistros: number;
  selecionadoId: string;
  destaqueId: string;
  abertos: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
};

export function ArvoreHierarquica({
  nos,
  totalRegistros,
  selecionadoId,
  destaqueId,
  abertos,
  onToggle,
  onSelect,
}: ArvoreHierarquicaProps) {
  return (
    <Card className="w-1/2 bg-[#090d16] border-slate-800 rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
            Árvore Hierárquica
          </h3>
          <span className="text-[11px] text-slate-500">
            {totalRegistros} registros
          </span>
        </div>

        <div className="space-y-0.5 max-h-[640px] overflow-y-auto pr-1">
          {nos.map((no) => (
            <TreeNodeItem
              key={no.id}
              no={no}
              profundidade={0}
              selecionadoId={selecionadoId}
              destaqueId={destaqueId}
              abertos={abertos}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}