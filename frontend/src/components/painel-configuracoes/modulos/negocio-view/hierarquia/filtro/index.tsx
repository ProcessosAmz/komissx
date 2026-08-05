import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { useEmpresas } from "@/hook/useEmpresa";
import { useEstados } from "@/hook/useEstados";
import { useUnidades } from "@/hook/useUnidade";
import type { FiltroUsuarios } from "@/types/filtro";

const selectClassName =
  "w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 cursor-pointer hover:border-slate-700";

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
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const empresas = empresasResponse?.data ?? [];
  const estados = estadosResponse?.data ?? [];
  const unidades = unidadesResponse?.data ?? [];

  return (
    <Card className="bg-[#090d16] border-slate-800 rounded-2xl">
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 w-full block">
        <div className="flex gap-4 w-full grid grid-cols-1 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Empresa
            </label>
            <select
              className={selectClassName}
              value={value.empresaId ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  empresaId: event.target.value || undefined,
                  unidadeId: undefined,
                })
              }
            >
              <option value="">TODAS</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Região / Estado
            </label>
            <select
              className={selectClassName}
              value={value.estadoId ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  estadoId: event.target.value || undefined,
                  unidadeId: undefined,
                })
              }
            >
              <option value="">TODAS</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Unidade
            </label>
            <select
              className={selectClassName}
              value={value.unidadeId ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  unidadeId: event.target.value || undefined,
                })
              }
            >
              <option value="">TODAS</option>
              {unidades.map((unidade) => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Input
            className="h-12 w-full rounded-xl border border-slate-900 bg-[#03050a] px-3 text-xs text-slate-300 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 cursor-pointer hover:border-slate-800"
            placeholder="Buscar supervisor, líder ou colaborador..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}