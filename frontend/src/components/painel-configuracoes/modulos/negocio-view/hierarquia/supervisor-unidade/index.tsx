import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Edit2 } from "lucide-react";
import { Trash2 } from "lucide-react";

export function SupervisorUnidade() {
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 tracking-wide">Supervisor da Unidade</h4>
            <Card className="bg-[#090d16] border-slate-800 rounded-2xl">
                <CardContent className="p-3 flex justify-between items-center">
                    <span className="text-slate-300 font-medium pl-2">Carlos Mendes</span>
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600/20">
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600/20">
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}