import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Edit2, Check, X, Save, Network } from 'lucide-react';

// 1. Definição explícita da Interface esperada pelo seu App / Rotas
export interface ModuloHierarquiaProps {
  dadosGlobais?: any;
  onSalvar?: (novosDadosGlobais: any) => void;
}

// Interface para o Contexto que vem lá do Outlet (PainelConfiguracoes)
interface OutletContextProps {
  globalRules: any;
  onSalvar: (novosDados: any) => void;
}

// 2. Exportação Nomeada Exata (Evita o erro de "does not provide an export named...")
export function ModuloHierarquia({ dadosGlobais: propsDados, onSalvar: propsOnSalvar }: ModuloHierarquiaProps) {
  
  // Captura do Outlet por segurança (fallback caso não venha via props direta)
  const context = useOutletContext<OutletContextProps>();
  const globalRules = propsDados || context?.globalRules;
  const onSalvar = propsOnSalvar || context?.onSalvar;

  // Estados dos Seletores (Alinhados com o topo da imagem)
  const [empresa, setEmpresa] = useState<string>('AMAZONET');
  const [unidade, setUnidade] = useState<string>('MANAUS');
  const [estadoRegiao, setEstadoRegiao] = useState<string>('AMAZONAS');

  // Mapeamento dinâmico baseado no fechamento_mensal
  const dadosMensais = globalRules?.fechamento_mensal || {};
  const empresasDisponiveis = Object.keys(dadosMensais);
  const unidadesDisponiveis = Object.keys(dadosMensais[empresa] || {});

  // Nó da hierarquia atual baseado nos seletores
  const hierarquiaUnidade = globalRules?.hierarquia?.[empresa]?.[unidade] || { supervisor: '', grupos: {} };
  const categoriasDoMensal = Object.keys(dadosMensais[empresa]?.[unidade]?.metas || {});
  const rotulosCategorias = dadosMensais[empresa]?.[unidade]?.rotulos_categorias || {};

  // Estados de Edição/Inserção Inline
  const [editandoSupervisor, setEditandoSupervisor] = useState(false);
  const [valSupervisor, setValSupervisor] = useState('');

  const [editandoLider, setEditandoLider] = useState<{ grupo: string; index: number } | null>(null);
  const [valLider, setValLider] = useState('');

  const [inserindoNoGrupo, setInserindoNoGrupo] = useState<string | null>(null);
  const [valNovoLider, setValNovoLider] = useState('');

  // Sincroniza os valores locais quando muda o filtro do topo
  useEffect(() => {
    setValSupervisor(hierarquiaUnidade.supervisor || '');
    setEditandoSupervisor(false);
    setEditandoLider(null);
    setInserindoNoGrupo(null);
  }, [empresa, unidade, globalRules]);

  // Persistência profunda no JSON global
  const actualizarGlobal = (novosDadosDaUnidade: any) => {
    if (!globalRules || !onSalvar) return;
    const cloneGlobal = JSON.parse(JSON.stringify(globalRules));
    
    if (!cloneGlobal.hierarquia) cloneGlobal.hierarquia = {};
    if (!cloneGlobal.hierarquia[empresa]) cloneGlobal.hierarquia[empresa] = {};
    
    cloneGlobal.hierarquia[empresa][unidade] = {
      ...cloneGlobal.hierarquia[empresa][unidade],
      ...novosDadosDaUnidade
    };

    onSalvar(cloneGlobal);
  };

  const handleSalvarSupervisor = () => {
    actualizarGlobal({ supervisor: valSupervisor.trim() });
    setEditandoSupervisor(false);
  };

  const handleAdicionarLider = (grupoChave: string) => {
    if (!valNovoLider.trim()) return;
    const listaLideres = hierarquiaUnidade.grupos?.[grupoChave]?.lideres || [];
    
    const novosGrupos = { ...hierarquiaUnidade.grupos };
    novosGrupos[grupoChave] = { lideres: [...lideres, valNovoLider.trim()] };

    actualizarGlobal({ grupos: novosGrupos });
    setValNovoLider('');
    setInserindoNoGrupo(null);
  };

  const handleSalvarEdicaoLider = (grupoChave: string, idx: number) => {
    if (!valLider.trim()) return;
    const listaLideres = [...(hierarquiaUnidade.grupos?.[grupoChave]?.lideres || [])];
    listaLideres[idx] = valLider.trim();

    const novosGrupos = { ...hierarquiaUnidade.grupos };
    novosGrupos[grupoChave] = { lideres: listaLideres };

    actualizarGlobal({ grupos: novosGrupos });
    setEditandoLider(null);
  };

  const handleRemoverLider = (grupoChave: string, idxParaRemover: number) => {
    const listaLideres = hierarquiaUnidade.grupos?.[grupoChave]?.lideres || [];
    
    const novosGrupos = { ...hierarquiaUnidade.grupos };
    novosGrupos[grupoChave] = { lideres: listaLideres.filter((_, i) => i !== idxParaRemover) };

    actualizarGlobal({ grupos: novosGrupos });
  };

  if (!globalRules) {
    return <div className="text-slate-500 text-xs italic p-4">Carregando estrutura de dados...</div>;
  }

  return (
    <div className="space-y-6 text-slate-200 antialiased font-sans">
      
      {/* SELETORES DO TOPO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#090d16] border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Empresa</label>
          <select value={empresa} onChange={e => setEmpresa(e.target.value)} className="w-full bg-[#05080f] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer">
            {empresasDisponiveis.map(emp => <option key={emp} value={emp}>{emp}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidade - Dinamicamente</label>
          <select value={unidade} onChange={e => setUnidade(e.target.value)} className="w-full bg-[#05080f] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer">
            {unidadesDisponiveis.map(uni => <option key={uni} value={uni}>{uni}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Região / Estado</label>
          <select value={estadoRegiao} onChange={e => setEstadoRegiao(e.target.value)} className="w-full bg-[#05080f] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer">
            <option value="AMAZONAS">AMAZONAS</option>
            <option value="PARA">PARÁ</option>
          </select>
        </div>
      </div>

      {/* CARD DA ESTRUTURA DE COMANDO */}
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/10 text-indigo-400 rounded-xl">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Estrutura de Comando</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Defina supervisores e líderes por grupo da unidade.</p>
          </div>
        </div>
        <button onClick={handleSalvarSupervisor} className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg">
          <Save className="h-4 w-4" />
        </button>
      </div>

      {/* SUPERVISOR */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-indigo-400 tracking-wide">Supervisor da Unidade</h4>
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-3 flex justify-between items-center">
          {editandoSupervisor ? (
            <div className="flex gap-2 w-full max-w-md">
              <input type="text" value={valSupervisor} onChange={e => setValSupervisor(e.target.value)} className="bg-[#05080f] border border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none w-full" />
              <button onClick={handleSalvarSupervisor} className="p-1.5 bg-emerald-600 rounded-lg text-white"><Check className="h-3.5 w-3.5" /></button>
              <button onClick={() => { setEditandoSupervisor(false); setValSupervisor(hierarquiaUnidade.supervisor || ''); }} className="p-1.5 bg-slate-800 rounded-lg text-slate-400"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <>
              <span className="text-slate-300 font-medium pl-2">{hierarquiaUnidade.supervisor || <span className="text-slate-600 italic text-[11px]">Nenhum supervisor definido</span>}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditandoSupervisor(true)} className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600/20 transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => { setValSupervisor(''); actualizarGlobal({ supervisor: '' }); }} className="p-2 bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600/20 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* GRUPOS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-indigo-400 tracking-wide border-b border-slate-800 pb-2">Grupos da Unidade</h4>
        
        <div className="space-y-4">
          {categoriasDoMensal.map((catChave) => {
            const rotuloAmigavel = rotulosCategorias[catChave] || catChave.replace('_', ' ');
            const lideres = hierarquiaUnidade.grupos?.[catChave]?.lideres || [];
            const isAdding = inserindoNoGrupo === catChave;

            return (
              <div key={catChave} className="bg-[#090d16] border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                <div className="px-5 py-3.5 bg-[#0b0f19] border-b border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">{rotuloAmigavel}</span>
                  <button onClick={() => { setInserindoNoGrupo(isAdding ? null : catChave); setValNovoLider(''); }} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isAdding && (
                  <div className="p-3 bg-indigo-950/10 border-b border-slate-800 flex gap-2">
                    <input type="text" placeholder="Nome do novo líder..." value={valNovoLider} onChange={e => setValNovoLider(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdicionarLider(catChave)} className="bg-[#05080f] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 flex-1 focus:outline-none focus:border-indigo-500" />
                    <button onClick={() => handleAdicionarLider(catChave)} className="p-1.5 bg-emerald-600 text-white rounded-xl"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setInserindoNoGrupo(null)} className="p-1.5 bg-slate-800 text-slate-400 rounded-xl"><X className="h-4 w-4" /></button>
                  </div>
                )}

                <div className="divide-y divide-slate-800/40">
                  {lideres.length === 0 ? (
                    <div className="p-4 text-slate-600 text-[11px] italic">Nenhum líder alocado neste grupo.</div>
                  ) : (
                    lideres.map((lider: string, idx: number) => {
                      const isEditing = editandoLider?.grupo === catChave && editandoLider.index === idx;

                      return (
                        <div key={idx} className="px-5 py-3 flex justify-between items-center hover:bg-[#0b0f19]/30 transition-colors">
                          {isEditing ? (
                            <div className="flex gap-2 w-full max-w-md">
                              <input type="text" value={valLider} onChange={e => setValLider(e.target.value)} className="bg-[#05080f] border border-indigo-500 rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none w-full" />
                              <button onClick={() => handleSalvarEdicaoLider(catChave, idx)} className="text-emerald-400 hover:text-emerald-300"><Check className="h-4 w-4" /></button>
                              <button onClick={() => setEditandoLider(null)} className="text-slate-500 hover:text-slate-400"><X className="h-4 w-4" /></button>
                            </div>
                          ) : (
                            <>
                              <span className="text-slate-300 text-xs font-medium font-mono">{lider}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setEditandoLider({ grupo: catChave, index: idx }); setValLider(lider); }} className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600/20 transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleRemoverLider(catChave, idx)} className="p-2 bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600/20 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-slate-800 flex justify-center">
        <button onClick={handleSalvarSupervisor} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2">
          <Save className="h-4 w-4" /> Salvar Alterações
        </button>
      </div>

    </div>
  );
}