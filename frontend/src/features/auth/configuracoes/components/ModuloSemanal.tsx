// src/features/configuracoes/components/ModuloSemanal.tsx
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ModuloSemanalProps {
  dados: any;
  onSalvar: (novosDados: any) => void;
}

export function ModuloSemanal({ dados, onSalvar }: ModuloSemanalProps) {
  const [tecnicos, setTecnicos] = useState(dados.tecnicos_terceirizados || {});
  const [novoTecnico, setNovoTecnico] = useState({ nome: '', valor: '' });

  const adicionarTecnico = () => {
    if (!novoTecnico.nome || !novoTecnico.valor) return;
    const atualizados = { ...tecnicos, [novoTecnico.nome.toUpperCase()]: Number(novoTecnico.valor) };
    setTecnicos(atualizados);
    setNovoTecnico({ nome: '', valor: '' });
  };

  const removerTecnico = (nome: string) => {
    const atualizados = { ...tecnicos };
    delete atualizados[nome];
    setTecnicos(atualizados);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-200">Parâmetros Semanais</h3>
        <p className="text-xs text-slate-500">Gerencie a tabela de custos de técnicos e instaladores terceirizados.</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 bg-[#05080f] p-3 rounded-xl border border-slate-800">
          <input 
            type="text" 
            placeholder="Nome do Técnico (Ex: GABRIEL)" 
            value={novoTecnico.nome}
            onChange={e => setNovoTecnico({ ...novoTecnico, nome: e.target.value })}
            className="bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs flex-1"
          />
          <input 
            type="number" 
            placeholder="Valor R$" 
            value={novoTecnico.valor}
            onChange={e => setNovoTecnico({ ...novoTecnico, valor: e.target.value })}
            className="bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs w-28"
          />
          <button onClick={adicionarTecnico} className="bg-indigo-600 hover:bg-indigo-500 px-3 rounded-lg text-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-[#05080f] rounded-xl p-3 border border-slate-800 divide-y divide-slate-800/60 font-mono text-xs">
          {Object.entries(tecnicos).map(([nome, valor]: [string, any]) => (
            <div key={nome} className="flex justify-between items-center py-2">
              <span className="text-slate-300">{nome}</span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-400">R$ {valor.toFixed(2)}</span>
                <button onClick={() => removerTecnico(nome)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={() => onSalvar({ ...dados, tecnicos_terceirizados: tecnicos })}
        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl float-right"
      >
        Salvar Módulo Semanal
      </button>
    </div>
  );
}