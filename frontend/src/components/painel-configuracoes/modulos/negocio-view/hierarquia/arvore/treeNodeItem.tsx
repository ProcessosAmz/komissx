import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cargoBadgeClass, getIniciais } from "@/utils/hierarquia";
import { HierarquiaNode } from "@/types/cargo";

type TreeNodeItemProps = {
  no: HierarquiaNode;
  profundidade: number;
  selecionadoId: string;
  destaqueId: string;
  abertos: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
};

export function TreeNodeItem({
  no,
  profundidade,
  selecionadoId,
  destaqueId,
  abertos,
  onToggle,
  onSelect,
}: TreeNodeItemProps) {
  const itemRef = useRef<HTMLButtonElement>(null);
  const temFilhos = (no.children?.length ?? 0) > 0;
  const aberto = abertos[no.id] ?? profundidade < 2;
  const selecionado = selecionadoId === no.id;
  const destaque = destaqueId === no.id;

  useEffect(() => {
    if (!destaque) {
      return;
    }

    itemRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [destaque]);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(profundidade * 0.04, 0.16),
      }}
    >
      <button
        ref={itemRef}
        type="button"
        onClick={() => onSelect(no.id)}
        className={`w-[95%] max-w-full flex items-center gap-2 rounded-xl border px-2.5 py-1 text-left transition-colors ${
          destaque
            ? "border-indigo-400 bg-indigo-500/15 animate-border-blink"
            : selecionado
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-slate-800 bg-[#05080f] hover:border-slate-700"
        }`}
        style={{ marginLeft: profundidade * 16 }}
      >
        <span
          className="shrink-0 w-4 h-4 flex items-center justify-center text-slate-500"
          onClick={(evento) => {
            if (!temFilhos) return;
            evento.stopPropagation();
            onToggle(no.id);
          }}
        >
          {temFilhos ? (
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${
                aberto ? "rotate-90" : "rotate-0"
              }`}
            />
          ) : null}
        </span>

        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-indigo-600/20 text-indigo-300 text-[10px] font-bold">
            {getIniciais(no.nome)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-100 truncate">
            {no.nome}
          </p>
          <p className="text-[10px] text-slate-500 truncate">{no.email}</p>
        </div>

        <Badge
          variant="outline"
          className={`text-[9px] font-bold tracking-wide shrink-0 ${cargoBadgeClass(no.cargo)}`}
        >
          {no.cargo}
        </Badge>
      </button>

      <AnimatePresence initial={false}>
        {temFilhos && aberto ? (
          <motion.div
            key={`${no.id}-filhos`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-0.5 space-y-0.5 overflow-hidden"
          >
            {no.children!.map((filho: HierarquiaNode) => (
              <TreeNodeItem
                key={filho.id}
                no={filho}
                profundidade={profundidade + 1}
                selecionadoId={selecionadoId}
                destaqueId={destaqueId}
                abertos={abertos}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}