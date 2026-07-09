import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ModuloHierarquiaProps {
  empresa: string;
  unidade: string;
  dadosGlobais: any;
  onSalvar: (novosDadosGlobais: any) => void;
}

export function ModuloHierarquia({ empresa, unidade, dadosGlobais, onSalvar }: ModuloHierarquiaProps) {
  // Busca o nó específico do contexto atual no JSON
  const contextoContext = dadosGlobais.hierarquia?.[empresa]?.[unidade] || { supervisores: [], lideres: [] };

  const [supervisores, setSupervisores] = useState<string[]>(contextoContext.supervisores || []);
  const [lideres, setLideres] = useState<string[]>(contextoContext.lideres || []);
  
  const [novoSupervisor, setNovoSupervisor] = useState('');
  const [novoLider, setNovoLider] = useState('');

  // Sincroniza o estado local caso o usuário mude a Empresa ou Unidade nos filtros superiores
  useEffect(() => {
    setSupervisores(contextoContext.supervisores || []);
    setLideres(contextoContext.lideres || []);
  }, [empresa, unidade, dadosGlobais]);

  const adicionarItem = (tipo: 'sup' | 'lid') => {
    if (tipo === 'sup' && novoSupervisor) {
      const atualizados = [...supervisores, novoSupervisor];
      setSupervisores(atualizados);
      persistirMudanca(atualizados, lideres);
      setNovoSupervisor('');
    } else if (tipo === 'lid' && novoLider) {
      const atualizados = [...lideres, novoLider];
      setLideres(atualizados);
      persistirMudanca(supervisores, atualizados);
      setNovoLider('');
    }
  };

  const removerItem = (tipo: 'sup' | 'lid', index: number) => {
    if (tipo === 'sup') {
      const atualizados = supervisores.filter((_, i) => i !== index);
      setSupervisores(atualizados);
      persistirMudanca(atualizados, lideres);
    } else {
      const atualizados = lideres.filter((_, i) => i !== index);
      setLideres(atualizados);
      persistirMudanca(supervisores, atualizados);
    }
  };

  const persistirMudanca = (novosSups: string[], novosLids: string[]) => {
    const cloneGlobal = { ...dadosGlobais };
    if (!cloneGlobal.hierarquia) cloneGlobal.hierarquia = {};
    if (!cloneGlobal.hierarquia[empresa]) cloneGlobal.hierarquia[empresa] = {};
    
    cloneGlobal.hierarquia[empresa][unidade] = {
      supervisores: novosSups,
      lideres: novosLids
    };
    
    onSalvar(cloneGlobal);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-200">Estrutura de Comando</h3>
        <p className="text-xs text-slate-500">Definição de lideranças locais para <span className="text-indigo-400 font-bold">{empresa}</span> em <span className="text-violet-400 font-bold">{unidade}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloco de Supervisores */}
        <div className="space-y-3 bg-[#05080f] p-4 rounded-xl border border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Supervisores (Unidade/Estado)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome do Supervisor" 
              value={novoSupervisor}
              onChange={e => setNovoSupervisor(e.target.value)}
              className="bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs flex-1 text-slate-300"
            />
            <button onClick={() => adicionarItem('sup')} className="bg-indigo-600 hover:bg-indigo-500 px-3 rounded-lg text-white text-xs">+</button>
          </div>
          <ul className="space-y-2 pt-2">
            {supervisores.map((sup, idx) => (
              <li key={idx} className="flex justify-between items-center text-xs font-mono bg-[#090d16] p-2 rounded-lg text-slate-300">
                <span>{sup}</span>
                <button onClick={() => removerItem('sup', idx)} className="text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bloco de Líderes */}
        <div className="space-y-3 bg-[#05080f] p-4 rounded-xl border border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Líderes de Equipe</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome do Líder" 
              value={novoLider}
              onChange={e => setNovoLider(e.target.value)}
              className="bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs flex-1 text-slate-300"
            />
            <button onClick={() => adicionarItem('lid')} className="bg-indigo-600 hover:bg-indigo-500 px-3 rounded-lg text-white text-xs">+</button>
          </div>
          <ul className="space-y-2 pt-2">
            {lideres.map((lid, idx) => (
              <li key={idx} className="flex justify-between items-center text-xs font-mono bg-[#090d16] p-2 rounded-lg text-slate-300">
                <span>{lid}</span>
                <button onClick={() => removerItem('lid', idx)} className="text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}