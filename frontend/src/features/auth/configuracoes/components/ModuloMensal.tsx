// src/features/configuracoes/components/ModuloMensal.tsx
import { useEffect, useState } from 'react';

interface ModuloMensalProps {
  empresa: string;
  unidade: string;
  dadosGlobais: any;
  onSalvar: (novosDadosGlobais: any) => void;
}

export function ModuloMensal({ empresa, unidade, dadosGlobais, onSalvar }: ModuloMensalProps) {
  const contextoMensal = dadosGlobais.fechamento_mensal?.[empresa]?.[unidade];
  const [metas, setMetas] = useState<any>(contextoMensal?.metas || {});

  useEffect(() => {
    setMetas(contextoMensal?.metas || {});
  }, [empresa, unidade, dadosGlobais]);

  const handleMudarValorFaixa = (categoria: string, faixaIdx: number, novoValor: number) => {
    const novasMetas = { ...metas };
    novasMetas[categoria][faixaIdx][2] = novoValor; // Altera o terceiro valor da tupla [min, max, VALOR]
    setMetas(novasMetas);

    // Persiste de volta na árvore estrutural do JSON global
    const cloneGlobal = { ...dadosGlobais };
    cloneGlobal.fechamento_mensal[empresa][unidade].metas = novasMetas;
    onSalvar(cloneGlobal);
  };

  if (!contextoMensal) {
    return <p className="text-xs text-slate-500 italic">Nenhuma configuração mapeada no JSON para este contexto.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-200">Metas e Faixas de Arrecadação Mensal</h3>
        <p className="text-xs text-slate-500">Altere o valor pago por comissão dentro das faixas do motor lógico.</p>
      </div>

      <div className="space-y-4">
        {contextoMensal.ordem_categorias?.map((cat: string) => {
          const label = contextoMensal.rotulos_categorias?.[cat] || cat;
          const faixas = metas[cat] || [];

          return (
            <div key={cat} className="bg-[#05080f] border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{label}</span>
              
              <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                {faixas.map((faixa: any, idx: number) => (
                  <div key={idx} className="bg-[#090d16] p-2 rounded-lg flex justify-between items-center text-slate-400">
                    <span>De <strong>{faixa[0]}</strong> até <strong>{faixa[1] ?? '∞'}</strong> vendas</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">R$</span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={faixa[2]} 
                        onChange={e => handleMudarValorFaixa(cat, idx, Number(e.target.value))}
                        className="bg-[#05080f] border border-slate-700 text-emerald-400 rounded px-2 py-0.5 w-20 text-right font-bold"
                      />
                      <span className="text-slate-500">/ venda</span>
                    </div>
                  </div>
                ))}
                {faixas.length === 0 && <span className="text-slate-600 italic text-[11px]">Categoria calculada por regra fixa externa (Ex: Backoffice).</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}