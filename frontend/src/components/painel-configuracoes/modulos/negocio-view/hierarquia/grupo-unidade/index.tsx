import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function GrupoUnidade() {
    return (
        
      <div className="space-y-4">
      <h4 className="text-xs font-bold text-indigo-400 tracking-wide border-b border-slate-800 pb-2">Grupos da Unidade</h4>

      <div className="space-y-4">
        <Card key="interno" className="bg-[#090d16] border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <CardHeader className="px-5 py-3.5 bg-[#0b0f19] border-b border-slate-800 flex-row justify-between items-center space-y-0">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">Interno</span>
            <Button size="icon" className="h-7 w-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-slate-800/40">
            <div className="p-4 text-slate-600 text-[11px] italic">Nenhum líder alocado neste grupo.</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card key="interno" className="bg-[#090d16] border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <CardHeader className="px-5 py-3.5 bg-[#0b0f19] border-b border-slate-800 flex-row justify-between items-center space-y-0">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">Externo</span>
            <Button size="icon" className="h-7 w-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-slate-800/40">
            <div className="p-4 text-slate-600 text-[11px] italic">Nenhum líder alocado neste grupo.</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card key="interno" className="bg-[#090d16] border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <CardHeader className="px-5 py-3.5 bg-[#0b0f19] border-b border-slate-800 flex-row justify-between items-center space-y-0">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">Recepção Unidades</span>
            <Button size="icon" className="h-7 w-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-slate-800/40">
            <div className="p-4 text-slate-600 text-[11px] italic">Nenhum líder alocado neste grupo.</div>
          </CardContent>
        </Card>
      </div>
    </div>
    )
}