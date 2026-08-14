import { useMemo, useState } from "react";
import { Filtro } from "./filtro";
import { contarNos, encontrarNo, mapUserApiToHierarquia } from "@/utils/hierarquia";
import { ArvoreHierarquica } from "./arvore";
import { DetalheColaborador } from "./detalhe";
import { useUsers } from "@/hooks/useUsers";
import type { FiltroUsuarios } from "@/types/filtro";

export function ModuloHierarquia() {
  const [filtros, setFiltros] = useState<FiltroUsuarios>({});
  const [selecionadoId, setSelecionadoId] = useState("");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const { data: usersResponse, isLoading } = useUsers(filtros);

  const tree = useMemo(
    () => mapUserApiToHierarquia(usersResponse?.data ?? []),
    [usersResponse?.data],
  );

  const totalRegistros = useMemo(() => contarNos(tree), [tree]);
  const selecionado = encontrarNo(tree, selecionadoId);

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