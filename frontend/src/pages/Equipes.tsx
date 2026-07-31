import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ModuloHierarquia } from '../components/painel-configuracoes/modulos/negocio-view/hierarquia';

// Tipagem do contexto que veio lá do PainelConfiguracoes
interface OutletContextProps {
  globalRules: any;
  onSalvar: (novosDados: any) => void;
}

export default function EquipesPage() {
  // Captura o estado global e a função de salvamento direto do Outlet do React Router
  const { globalRules, onSalvar } = useOutletContext<OutletContextProps>();

  // Estados locais para controlar quais filtros o usuário selecionou na tela
  const [empresaSelecionada, setEmpresaSelecionada] = useState('AMAZONET');
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('MANAUS');

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Superiores */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-[#05080f] rounded-xl border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Empresa</label>
          <select
            value={empresaSelecionada}
            onChange={(e) => {
              setEmpresaSelecionada(e.target.value);
              // Reset opcional ou ajuste padrão ao trocar de empresa
              if (e.target.value === 'MANIA') setUnidadeSelecionada('MANAUS'); 
            }}
            className="bg-[#090d16] border border-slate-700 text-xs text-slate-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="AMAZONET">AMAZONET</option>
            <option value="MANIA">MANIA</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Unidade / Estado</label>
          <select
            value={unidadeSelecionada}
            onChange={(e) => setUnidadeSelecionada(e.target.value)}
            className="bg-[#090d16] border border-slate-700 text-xs text-slate-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="MANAUS">MANAUS</option>
            <option value="AMAZONAS">AMAZONAS</option>
            <option value="PARA">PARÁ</option>
          </select>
        </div>
      </div>

      {/* Componente Modular de Hierarquia */}
      <ModuloHierarquia
        empresa={empresaSelecionada}
        unidade={unidadeSelecionada}
        dadosGlobais={globalRules}
        onSalvar={onSalvar}
      />
    </div>
  );
}