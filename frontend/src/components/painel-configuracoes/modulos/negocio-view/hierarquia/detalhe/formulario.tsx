import { Input } from "@/components/ui/input";
import { HierarquiaNode } from "@/types/cargo";

type FormularioColaboradorProps = {
  selecionado: HierarquiaNode;
};

export function FormularioColaborador({
  selecionado,
}: FormularioColaboradorProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Nome
          </label>
          <Input
            label="Nome"
            defaultValue={selecionado.nome}
            key={`${selecionado.id}-nome`}
            className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Email
          </label>
          <Input
            label="Email"
            defaultValue={selecionado.email}
            key={`${selecionado.id}-email`}
            className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Cargo
          </label>
          <Input
            label="Cargo"
            defaultValue={selecionado.cargo}
            disabled
            key={`${selecionado.id}-cargo`}
            className="h-9 rounded-xl border-slate-800 bg-[#03050a] text-xs opacity-70"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Operadora
          </label>
          <select
            key={`${selecionado.id}-operadora`}
            defaultValue={selecionado.operadora}
            className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
          >
            <option value="AMAZONET">AMAZONET</option>
            <option value="MANIA">MANIA</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Regional
          </label>
          <Input
            label="Regional"
            defaultValue={selecionado.regional}
            key={`${selecionado.id}-regional`}
            className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            ID Hubsoft
          </label>
          <Input
            label="ID Hubsoft"
            defaultValue={selecionado.idHubsoft}
            key={`${selecionado.id}-hubsoft`}
            className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#05080f] px-3 py-2.5">
        <span className="text-xs text-slate-300">
          Participa fechamento mensal
        </span>
        <button
          type="button"
          className={`relative h-5 w-9 rounded-full transition-colors ${
            selecionado.participaFechamento ? "bg-indigo-500" : "bg-slate-700"
          }`}
          aria-label="Participa fechamento mensal"
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              selecionado.participaFechamento ? "left-4" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </>
  );
}