import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEmpresas } from "@/hooks/useEmpresa";
import { useEstados } from "@/hooks/useEstados";
import { useRoles } from "@/hooks/useRoles";
import { useUnidades } from "@/hooks/useUnidade";
import { FilterSelect } from "@/components/painel-configuracoes/modulos/negocio-view/hierarquia/filtro/select";
import type { FiltroUsuarios } from "@/types/filtro";

type FiltroProps = {
  value: FiltroUsuarios;
  onChange: (value: FiltroUsuarios) => void;
};

const PARTICIPA_FECHAMENTO_OPTIONS = [
  { id: "true", name: "SIM" },
  { id: "false", name: "NÃO" },
];

function parseParticipaFechamento(value?: string): boolean | undefined {
  switch (value) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      return undefined;
  }
}

export function Filtro({ value, onChange }: FiltroProps) {
  const [searchInput, setSearchInput] = useState(value.search ?? "");
  const { data: empresasResponse } = useEmpresas();
  const { data: estadosResponse } = useEstados();
  const { data: rolesResponse } = useRoles();
  const { data: unidadesResponse } = useUnidades({
    empresaId: value.empresaId,
    estadoId: value.estadoId,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextSearch = searchInput.trim();
      onChange({
        ...value,
        search: nextSearch || undefined,
      });
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const empresas = empresasResponse?.data ?? [];
  const estados = estadosResponse?.data ?? [];
  const unidades = unidadesResponse?.data ?? [];
  const cargos = rolesResponse?.data ?? [];
  const canSelectUnidade = Boolean(value.empresaId);
  const participaFechamentoValue =
    value.participaFechamento === undefined
      ? undefined
      : String(value.participaFechamento);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="bg-[#090d16] border-slate-800 rounded-2xl">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
            <FilterSelect
              label="Empresa"
              value={value.empresaId}
              options={empresas}
              onChange={(empresaId) =>
                onChange({ ...value, empresaId, unidadeId: undefined })
              }
            />

            <FilterSelect
              label="Região / Estado"
              value={value.estadoId}
              options={estados}
              onChange={(estadoId) =>
                onChange({ ...value, estadoId, unidadeId: undefined })
              }
            />

            <FilterSelect
              label="Unidade"
              value={value.unidadeId}
              options={unidades}
              disabled={!canSelectUnidade}
              onChange={(unidadeId) => onChange({ ...value, unidadeId })}
            />

            <FilterSelect
              label="Cargo"
              value={value.roleId}
              options={cargos}
              emptyLabel="TODOS"
              onChange={(roleId) => onChange({ ...value, roleId })}
            />

            <FilterSelect
              label="Participa fechamento"
              value={participaFechamentoValue}
              options={PARTICIPA_FECHAMENTO_OPTIONS}
              emptyLabel="TODOS"
              onChange={(selected) =>
                onChange({
                  ...value,
                  participaFechamento: parseParticipaFechamento(selected),
                })
              }
            />
          </div>

          <Input
            type="text"
            placeholder="Buscar por nome..."
            className="w-full h-11 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 hover:border-slate-700"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}