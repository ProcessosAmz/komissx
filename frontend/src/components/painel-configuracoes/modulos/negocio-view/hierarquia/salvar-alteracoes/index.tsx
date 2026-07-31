import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export function SalvarAlteracoes() {
    return (
        <div className="pt-4 border-t border-slate-800 flex justify-center">
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-8 rounded-xl shadow-lg">
          <Save className="h-4 w-4" /> Salvar Alterações
        </Button>
      </div>

    )
}