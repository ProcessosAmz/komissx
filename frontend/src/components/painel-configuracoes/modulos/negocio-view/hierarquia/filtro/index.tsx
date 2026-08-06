import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { useEmpresas } from "@/hook/useEmpresa";
import { useEstados } from "@/hook/useEstados";
import { useUnidades } from "@/hook/useUnidade";
import { FilterSelect } from "@/components/painel-configuracoes/modulos/negocio-view/hierarquia/filtro/select";
import type { FiltroUsuarios } from "@/types/filtro";

type FiltroProps = {
  value: FiltroUsuarios;
  onChange: (value: FiltroUsuarios) => void;
};

export function Filtro({ value, onChange }: FiltroProps) {
  const [searchInput, setSearchInput] = useState(value.search ?? "");
  const { data: empresasResponse } = useEmpresas();
  const { data: estadosResponse } = useEstados();
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
  const canSelectUnidade = Boolean(value.empresaId) && Boolean(value.estadoId);

  return (
    <Card className="bg-[#090d16] border-slate-800 rounded-2xl">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex gap-4 w-full">
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
  );
}