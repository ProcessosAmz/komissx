import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Network, Save } from "lucide-react";

export function EstruturaComando() {
    return (
        <Card className="bg-[#090d16] border-slate-800 rounded-2xl shadow-xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/10 text-indigo-400 rounded-xl">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-100">Estrutura de Comando</CardTitle>
              <CardDescription className="text-slate-500 text-[11px] mt-0.5">
                Defina supervisores e líderes por grupo da unidade.
              </CardDescription>
            </div>
          </div>
          <Button size="icon" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg">
            <Save className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
}