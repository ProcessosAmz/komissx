import { Card, CardContent } from "@/components/ui/card";
import { EMPRESAS, UNIDADES, ESTADOS } from "./utils/opcoesFiltro";

const selectClassName =
  "w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 cursor-pointer hover:border-slate-700";

export function Filtro() {
  return (
    <Card className="bg-[#090d16] border-slate-800 rounded-2xl">
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Empresa
          </label>
          <select className={selectClassName} defaultValue="">
            <option value="" disabled>
              Selecione a empresa
            </option>
            {EMPRESAS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Região / Estado
          </label>
          <select className={selectClassName} defaultValue="">
            <option value="" disabled>
              Selecione a região
            </option>
            {ESTADOS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Unidade
          </label>
          <select className={selectClassName} defaultValue="">
            <option value="" disabled>
              Selecione a unidade
            </option>
            {UNIDADES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}