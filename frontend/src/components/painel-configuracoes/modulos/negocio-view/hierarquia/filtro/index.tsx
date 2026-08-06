import { Card, CardContent } from "@/components/ui/card";
import { useEmpresas } from "@/hook/useEmpresa";
import { useEstados } from "@/hook/useEstados";
import { useUnidades } from "@/hook/useUnidade";
import { FilterSelect } from "@/components/painel-configuracoes/modulos/negocio-view/hierarquia/filtro/select";
import type { FiltroUsuarios } from "@/types/filtro";
import { Input } from "@/components/ui/Input";

type FiltroProps = {
  value: FiltroUsuarios;
  onChange: (value: FiltroUsuarios) => void;
};

export function Filtro({ value, onChange }: FiltroProps) {
  const { data: empresasResponse } = useEmpresas();
  const { data: estadosResponse } = useEstados();
  const { data: unidadesResponse } = useUnidades({
    empresaId: value.empresaId,
    estadoId: value.estadoId,
  });

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
        <div>
          <Input
            type="text"
            placeholder="Buscar supervisor, líder ou colaborador..."
            className="w-full h-11 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 cursor-pointer hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-800"
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}