import { Plus, Trash2, Edit2, Check, Save, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Filtro } from './filtro';

const GRUPOS_MOCK = [
  { chave: 'grupo_a', rotulo: 'GRUPO A', lideres: ['João Silva', 'Maria Souza'] },
  { chave: 'grupo_b', rotulo: 'GRUPO B', lideres: ['Pedro Lima'] },
  { chave: 'grupo_c', rotulo: 'GRUPO C', lideres: [] },
];

export function ModuloHierarquia() {
  return (
    <div className="space-y-6 text-slate-200 antialiased font-sans">
      <Filtro />

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

      <div className="space-y-4">
        <h4 className="text-xs font-bold text-indigo-400 tracking-wide border-b border-slate-800 pb-2">Grupos da Unidade</h4>

        <div className="space-y-4">
          {GRUPOS_MOCK.map(({ chave, rotulo, lideres }) => (
            <Card key={chave} className="bg-[#090d16] border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <CardHeader className="px-5 py-3.5 bg-[#0b0f19] border-b border-slate-800 flex-row justify-between items-center space-y-0">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">{rotulo}</span>
                <Button size="icon" className="h-7 w-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>

              <div className="p-3 bg-indigo-950/10 border-b border-slate-800 flex gap-2">
                <Input label="Nome do novo líder..." placeholder="Nome do novo líder..." className="bg-[#05080f] border-slate-700 rounded-xl text-slate-300 flex-1" />
                <Button size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                  <Check className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-0 divide-y divide-slate-800/40">
                {lideres.length === 0 ? (
                  <div className="p-4 text-slate-600 text-[11px] italic">Nenhum líder alocado neste grupo.</div>
                ) : (
                  lideres.map((lider) => (
                    <div key={lider} className="px-5 py-3 flex justify-between items-center hover:bg-[#0b0f19]/30 transition-colors">
                      <span className="text-slate-300 text-xs font-medium font-mono">{lider}</span>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600/20">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600/20">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-center">
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-8 rounded-xl shadow-lg">
          <Save className="h-4 w-4" /> Salvar Alterações
        </Button>
      </div>

    </div>
  );
}