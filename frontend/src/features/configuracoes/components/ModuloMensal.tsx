import { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X, Plus } from 'lucide-react';

// Tipagem baseada na estrutura de tuplas do seu JSON: [inicio, fim, valor]
type FaixaMetasTuple = [number, number | null, number];

interface ModuloMensalProps {
  jsonOriginal: any; 
  onSalvar: (jsonAtualizado: any) => void;
}

export function ModuloMensal({ jsonOriginal, onSalvar }: ModuloMensalProps) {
  // Extrai com segurança o nó correto do fechamento_mensal
  const dadosMensaisIniciais = jsonOriginal?.fechamento_mensal || jsonOriginal || {};

  const [estadoMetas, setEstadoMetas] = useState<Record<string, any>>(dadosMensaisIniciais);

  // 2. Estados dos Seletores
  const [empresa, setEmpresa] = useState<string>('AMAZONET');
  const [unidade, setUnidade] = useState<string>('MANAUS');

  // Sincroniza caso o componente pai atualize os dados de forma assíncrona
  useEffect(() => {
    if (jsonOriginal) {
      const atual = jsonOriginal.fechamento_mensal || jsonOriginal || {};
      setEstadoMetas(atual);
      
      // Garante que os seletores não fiquem presos em chaves que não existem no novo JSON
      const empresas = Object.keys(atual);
      if (empresas.length > 0 && !empresas.includes(empresa)) {
        setEmpresa(empresas[0]);
        const unidades = Object.keys(atual[empresas[0]] || {});
        if (unidades.length > 0) setUnidade(unidades[0]);
      }
    }
  }, [jsonOriginal]);

  // 3. Estados para controle de Edição Inline
  const [editandoLinha, setEditandoLinha] = useState<{ categoria: string; index: number } | null>(null);
  const [camposEdicao, setCamposEdicao] = useState({ inicio: '', fim: '', valor: '' });

  // 4. Estados para controle de Inserção de Nova Linha
  const [inserindoNaCategoria, setInserindoNaCategoria] = useState<string | null>(null);
  const [camposNovaFaixa, setCamposNovaFaixa] = useState({ inicio: '', fim: '', valor: '' });

  // Listas dinâmicas baseadas nas chaves do JSON
  const empresasDisponiveis = Object.keys(estadoMetas || {});
  const unidadesDisponiveis = Object.keys(estadoMetas?.[empresa] || {});

  const handleMudarEmpresa = (novaEmp: string) => {
    setEmpresa(novaEmp);
    const proximasUnis = Object.keys(estadoMetas?.[novaEmp] || {});
    if (proximasUnis.length > 0) {
      setUnidade(proximasUnis[0]);
    }
    cancelarTodasAcoes();
  };

  const cancelarTodasAcoes = () => {
    setEditandoLinha(null);
    setInserindoNaCategoria(null);
  };

  // Acessando de forma segura a propriedade interna .metas daquela unidade específica
  const metasUnidade = estadoMetas?.[empresa]?.[unidade] || {};
  const categoriasAtivas = metasUnidade.metas || {};
  const ordemCategorias = metasUnidade.ordem_categorias || Object.keys(categoriasAtivas);
  const rotulosCategorias = metasUnidade.rotulos_categorias || {};

  // --- FUNÇÃO DE PERSISTÊNCIA CENTRALIZADA ---
  const persistirMudancaNoGlobal = (novoEstadoMetas: any) => {
    setEstadoMetas(novoEstadoMetas);
    
    if (jsonOriginal?.fechamento_mensal) {
      onSalvar({
        ...jsonOriginal,
        fechamento_mensal: novoEstadoMetas
      });
    } else {
      onSalvar(novoEstadoMetas);
    }
  };

  // --- ACTIONS ---

  const handleRemover = (categoria: string, index: number) => {
    const clone = JSON.parse(JSON.stringify(estadoMetas));
    if (clone[empresa]?.[unidade]?.metas?.[categoria]) {
      clone[empresa][unidade].metas[categoria] = clone[empresa][unidade].metas[categoria].filter((_: any, i: number) => i !== index);
      persistirMudancaNoGlobal(clone);
    }
  };

  const handleIniciarEdicao = (categoria: string, index: number, faixa: FaixaMetasTuple) => {
    setEditandoLinha({ categoria, index });
    setCamposEdicao({
      inicio: faixa[0]?.toString() || '0',
      fim: faixa[1] === null ? 'inf' : faixa[1]?.toString() || '0',
      valor: faixa[2]?.toString() || '0',
    });
  };

  const handleSalvarEdicao = (categoria: string, index: number) => {
    const clone = JSON.parse(JSON.stringify(estadoMetas));
    const fimValor = camposEdicao.fim.toLowerCase().trim() === 'inf' || camposEdicao.fim === '∞' ? null : Number(camposEdicao.fim);
    
    clone[empresa][unidade].metas[categoria][index] = [
      Number(camposEdicao.inicio),
      fimValor,
      Number(camposEdicao.valor)
    ];

    persistirMudancaNoGlobal(clone);
    setEditandoLinha(null);
  };

  const handleAdicionarNovaFaixa = (categoria: string) => {
    if (!camposNovaFaixa.inicio || !camposNovaFaixa.fim || !camposNovaFaixa.valor) return;

    const clone = JSON.parse(JSON.stringify(estadoMetas));
    const fimValor = camposNovaFaixa.fim.toLowerCase().trim() === 'inf' || camposNovaFaixa.fim === '∞' ? null : Number(camposNovaFaixa.fim);

    if (!clone[empresa][unidade].metas[categoria]) {
      clone[empresa][unidade].metas[categoria] = [];
    }

    clone[empresa][unidade].metas[categoria].push([
      Number(camposNovaFaixa.inicio),
      fimValor,
      Number(camposNovaFaixa.valor)
    ]);

    persistirMudancaNoGlobal(clone);
    setInserindoNaCategoria(null);
    setCamposNovaFaixa({ inicio: '', fim: '', valor: '' });
  };

  const formatarFim = (valor: number | null) => {
    return valor === null ? '∞' : valor;
  };

  if (empresasDisponiveis.length === 0) {
    return (
      <div className="text-center py-12 bg-[#020408] rounded-2xl border border-slate-900 text-slate-500 font-sans max-w-4xl mx-auto">
        <p className="animate-pulse">Aguardando dados de fechamento mensal...</p>
      </div>
    );
  }

  // Mapeia e ordena as categorias usando a lista de ordem original (se houver)
  const listaCategoriasOrdenadas = [...ordemCategorias].filter(cat => categoriasAtivas[cat] !== undefined);

  return (
    <div className="space-y-6 text-xs font-sans bg-[#020408] p-6 rounded-2xl border border-slate-900 max-w-4xl mx-auto text-slate-200">
      
      {/* HEADER DA SEÇÃO */}
      <div className="text-center py-4 bg-[#05080f] border border-slate-800 rounded-xl">
        <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100">CONFIGURAÇÃO MENSAL - METAS</h3>
        <p className="text-slate-500 text-[11px] mt-1">Gerencie as tabelas de metas por categoria comercial</p>
      </div>

      {/* SELETORES */}
      <div className="flex gap-6 justify-center items-center bg-[#05080f]/50 p-4 rounded-xl border border-slate-800/60">
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400 font-semibold block">Empresa</label>
          <select
            value={empresa}
            onChange={e => handleMudarEmpresa(e.target.value)}
            className="bg-[#090d16] text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 focus:outline-none min-w-[180px] cursor-pointer"
          >
            {empresasDisponiveis.map(emp => <option key={emp} value={emp}>{emp}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-400 block font-semibold">Unidade</label>
          <select
            value={unidade}
            onChange={e => { setUnidade(e.target.value); cancelarTodasAcoes(); }}
            className="bg-[#090d16] text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 focus:outline-none min-w-[180px] cursor-pointer"
          >
            {unidadesDisponiveis.length > 0 ? (
              unidadesDisponiveis.map(uni => <option key={uni} value={uni}>{uni}</option>)
            ) : (
              <option value="">Nenhuma cadastrada</option>
            )}
          </select>
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* QUADRO DE CATEGORIAS */}
      <div className="space-y-6">
        {listaCategoriasOrdenadas.length === 0 ? (
          <p className="text-slate-500 italic text-center py-6">Nenhuma meta configurada para a unidade {unidade}.</p>
        ) : (
          listaCategoriasOrdenadas.map((nomeCategoria) => {
            const faixas = categoriasAtivas[nomeCategoria] || [];
            const estáInserindo = inserindoNaCategoria === nomeCategoria;
            const rotuloAmigavel = rotulosCategorias[nomeCategoria] || nomeCategoria.replace('_', ' ');

            return (
              <div key={nomeCategoria} className="bg-[#05080f] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="bg-[#090d16] px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-200 text-xs tracking-wide uppercase">
                    {rotuloAmigavel}
                  </span>
                  {!estáInserindo && (
                    <button
                      onClick={() => { cancelarTodasAcoes(); setInserindoNaCategoria(nomeCategoria); }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Nova Faixa
                    </button>
                  )}
                </div>

                {/* Form Adicionar */}
                {estáInserindo && (
                  <div className="bg-indigo-950/20 border-b border-indigo-900/40 p-3 flex items-center gap-3">
                    <input
                      type="number" placeholder="Início" value={camposNovaFaixa.inicio}
                      onChange={e => setCamposNovaFaixa({ ...camposNovaFaixa, inicio: e.target.value })}
                      className="bg-[#090d16] border border-slate-700 rounded px-2 py-1 w-20 text-slate-200 font-mono"
                    />
                    <input
                      type="text" placeholder="Fim (ou inf)" value={camposNovaFaixa.fim}
                      onChange={e => setCamposNovaFaixa({ ...camposNovaFaixa, fim: e.target.value })}
                      className="bg-[#090d16] border border-slate-700 rounded px-2 py-1 w-24 text-slate-200 font-mono"
                    />
                    <input
                      type="number" step="0.1" placeholder="Valor" value={camposNovaFaixa.valor}
                      onChange={e => setCamposNovaFaixa({ ...camposNovaFaixa, valor: e.target.value })}
                      className="bg-[#090d16] border border-slate-700 rounded px-2 py-1 w-24 text-emerald-400 font-mono font-bold"
                    />
                    <div className="flex gap-1.5 ml-auto">
                      <button onClick={() => handleAdicionarNovaFaixa(nomeCategoria)} className="bg-emerald-600 p-1 rounded text-white hover:bg-emerald-500 transition-colors"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setInserindoNaCategoria(null)} className="bg-slate-800 p-1 rounded text-slate-400 hover:bg-slate-700 transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )}

                {/* Tabela de metas */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono">
                    <thead>
                      <tr className="bg-[#03060b] text-slate-500 border-b border-slate-800 font-sans text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-4 font-semibold w-1/4">Início</th>
                        <th className="py-2.5 px-4 font-semibold w-1/4">Fim</th>
                        <th className="py-2.5 px-4 font-semibold w-1/4">Valor Prêmio</th>
                        <th className="py-2.5 px-4 font-semibold text-right w-1/4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {faixas.map((faixa: FaixaMetasTuple, idx: number) => {
                        const isEditing = editandoLinha?.categoria === nomeCategoria && editandoLinha.index === idx;

                        return (
                          <tr key={idx} className="hover:bg-[#090d16]/30 transition-colors">
                            {isEditing ? (
                              <>
                                <td className="py-2 px-4">
                                  <input
                                    type="number" value={camposEdicao.inicio}
                                    onChange={e => setCamposEdicao({ ...camposEdicao, inicio: e.target.value })}
                                    className="bg-[#0e1422] border border-indigo-500 rounded px-1.5 py-0.5 w-20 text-slate-200"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input
                                    type="text" value={camposEdicao.fim}
                                    onChange={e => setCamposEdicao({ ...camposEdicao, fim: e.target.value })}
                                    className="bg-[#0e1422] border border-indigo-500 rounded px-1.5 py-0.5 w-24 text-slate-200"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input
                                    type="number" step="0.1" value={camposEdicao.valor}
                                    onChange={e => setCamposEdicao({ ...camposEdicao, valor: e.target.value })}
                                    className="bg-[#0e1422] border border-indigo-500 rounded px-1.5 py-0.5 w-24 text-emerald-400 font-bold"
                                  />
                                </td>
                                <td className="py-2 px-4 text-right flex justify-end gap-2">
                                  <button onClick={() => handleSalvarEdicao(nomeCategoria, idx)} className="text-emerald-400 bg-emerald-500/10 p-1 rounded hover:bg-emerald-500/20 transition-colors"><Check className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => setEditandoLinha(null)} className="text-red-400 bg-red-500/10 p-1 rounded hover:bg-red-500/20 transition-colors"><X className="h-3.5 w-3.5" /></button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-2.5 px-4 text-slate-100 font-semibold">{faixa[0]}</td>
                                <td className="py-2.5 px-4 text-slate-400">{formatarFim(faixa[1])}</td>
                                <td className="py-2.5 px-4 text-emerald-400 font-bold">{faixa[2]}</td>
                                <td className="py-2.5 px-4 text-right font-sans">
                                  <div className="flex justify-end items-center gap-3">
                                    <button
                                      onClick={() => handleIniciarEdicao(nomeCategoria, idx, faixa)}
                                      className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                                    >
                                      <Edit2 className="h-3 w-3" /> Editar
                                    </button>
                                    <button
                                      onClick={() => handleRemover(nomeCategoria, idx)}
                                      className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" /> Remover
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}