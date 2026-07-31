import { Filtro } from './filtro';
import { SupervisorUnidade } from './supervisor-unidade';
import { EstruturaComando } from './estrutura-comando';
import { GrupoUnidade } from './grupo-unidade';
import { SalvarAlteracoes } from './salvar-alteracoes';

export function ModuloHierarquia() {
  return (
    <div className="space-y-6 text-slate-200 antialiased font-sans">
      <Filtro />
      <EstruturaComando />
      <SupervisorUnidade />
      <GrupoUnidade />
      <SalvarAlteracoes />
    </div>
  );
}