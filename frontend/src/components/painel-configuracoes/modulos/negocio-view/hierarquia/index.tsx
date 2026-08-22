import { useEffect, useMemo, useState } from "react";
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

export function ModuloHierarquia() {
  const [filtros, setFiltros] = useState<FiltroUsuarios>({});
  const [selecionadoId, setSelecionadoId] = useState("");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const { highlightId, clearHighlight } = useCreatedUserHighlight();

  const { data: usersResponse, isLoading } = useUsers(filtros);

  const tree = useMemo(
    () => mapUserApiToHierarquia(usersResponse?.data ?? []),
    [usersResponse?.data],
  );

  const totalRegistros = useMemo(() => contarNos(tree), [tree]);
  const selecionado = encontrarNo(tree, selecionadoId);

  useEffect(() => {
    if (!highlightId) {
      return;
    }

    const caminho = encontrarCaminho(tree, highlightId);
    if (!caminho) {
      return;
    }

    setSelecionadoId(highlightId);
    setAbertos((atual) => {
      const proximos = { ...atual };
      caminho.forEach((nodeId) => {
        proximos[nodeId] = true;
      });
      return proximos;
    });

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

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando usuários...</p>
      ) : tree.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhum usuário encontrado para os filtros atuais.
        </p>
      ) : (
        <div className="flex justify-between gap-4">
          <ArvoreHierarquica
            nos={tree}
            totalRegistros={totalRegistros}
            selecionadoId={selecionadoId}
            destaqueId={highlightId}
            abertos={abertos}
            onToggle={onToggle}
            onSelect={setSelecionadoId}
          />
          <DetalheColaborador selecionado={selecionado} />
        </div>
      )}
    </div>
  );
}
