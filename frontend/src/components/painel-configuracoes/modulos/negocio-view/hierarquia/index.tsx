import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Filtro } from "./filtro";
import {
  contarNos,
  encontrarCaminho,
  encontrarNo,
  mapUserApiToHierarquia,
} from "@/utils/hierarquia";
import { ArvoreHierarquica } from "./arvore";
import { DetalheColaborador } from "./detalhe";
import { useUsers } from "@/hooks/useUsers";
import { useCreatedUserHighlight } from "@/hooks/useCreatedUserHighlight";
import type { FiltroUsuarios } from "@/types/filtro";

const HIGHLIGHT_DURATION_IN_MS = 2800;

function HierarquiaSkeleton() {
  return (
    <div className="flex justify-between gap-4">
      <div className="w-1/2 space-y-3 rounded-2xl border border-slate-800 bg-[#090d16] p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-[95%] rounded-xl ml-4" />
        <Skeleton className="h-11 w-[90%] rounded-xl ml-8" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-[92%] rounded-xl ml-4" />
        <Skeleton className="h-11 w-[88%] rounded-xl ml-8" />
      </div>
      <div className="w-1/2 space-y-4 rounded-2xl border border-slate-800 bg-[#090d16] p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-2/3 rounded-xl" />
      </div>
    </div>
  );
}

export function ModuloHierarquia() {
  const [filtros, setFiltros] = useState<FiltroUsuarios>({});
  const [selecionadoId, setSelecionadoId] = useState("");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const { highlightId, clearHighlight } = useCreatedUserHighlight();

  const { data: usersResponse, isFetching } = useUsers(filtros);

  const tree = useMemo(
    () => mapUserApiToHierarquia(usersResponse?.data ?? []),
    [usersResponse?.data],
  );

  const totalRegistros = useMemo(() => contarNos(tree), [tree]);
  const caminhoHighlight = highlightId
    ? encontrarCaminho(tree, highlightId)
    : null;

  if (caminhoHighlight) {
    if (highlightId !== selecionadoId) {
      setSelecionadoId(highlightId);
    }

    const precisaExpandir = caminhoHighlight.some(
      (nodeId) => abertos[nodeId] !== true,
    );

    if (precisaExpandir) {
      setAbertos((atual) => {
        const proximos = { ...atual };
        caminhoHighlight.forEach((nodeId) => {
          proximos[nodeId] = true;
        });
        return proximos;
      });
    }
  }

  const selecionado = encontrarNo(tree, selecionadoId);

  useEffect(() => {
    if (!highlightId) {
      return;
    }

    const caminho = encontrarCaminho(tree, highlightId);
    if (!caminho) {
      return;
    }

    const timeoutId = setTimeout(() => {
      clearHighlight();
    }, HIGHLIGHT_DURATION_IN_MS);

    return () => clearTimeout(timeoutId);
  }, [highlightId, tree, clearHighlight]);

  const onToggle = (id: string) => {
    setAbertos((atual) => ({ ...atual, [id]: !(atual[id] ?? false) }));
  };

  return (
    <div className="space-y-6 text-slate-200 antialiased font-sans">
      <Filtro value={filtros} onChange={setFiltros} />

      {isFetching ? (
        <HierarquiaSkeleton />
      ) : tree.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-slate-500"
        >
          Nenhum usuário encontrado para os filtros atuais.
        </motion.p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-between gap-4"
        >
          <ArvoreHierarquica
            nos={tree}
            totalRegistros={totalRegistros}
            selecionadoId={selecionadoId}
            destaqueId={highlightId}
            abertos={abertos}
            onToggle={onToggle}
            onSelect={setSelecionadoId}
          />
          <DetalheColaborador
            selecionado={selecionado}
            onDeleted={() => setSelecionadoId("")}
          />
        </motion.div>
      )}
    </div>
  );
}