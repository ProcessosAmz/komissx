import React, { useState } from 'react';
import { Curso, Aula, Modulo } from '../types';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface AulaSidebarProps {
    curso: Curso;
    aulaAtiva: Aula;
    onSelecionarAula: (aula: Aula) => void;
}

export const AulaSidebar: React.FC<AulaSidebarProps> = ({ curso, aulaAtiva, onSelecionarAula }) => {
    // 🛡️ Garante que modulos sempre seja um array, mesmo se curso ou curso.modulos vierem indefinidos
    const modulos = curso?.modulos || [];

    const [modulosAbertos, setModulosAbertos] = useState<Record<string, boolean>>(() => {
        // Uso seguro do Optional Chaining (?.)
        const moduloInicial = modulos.find(m => m?.aulas?.some(a => a?.id === aulaAtiva?.id));
        return moduloInicial
            ? { [moduloInicial.id]: true }
            : modulos[0] ? { [modulos[0].id]: true } : {};
    });

    const toggleModulo = (id: string) => {
        setModulosAbertos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const calcularProgressoModulo = (modulo: Modulo) => {
        if (!modulo?.aulas?.length) return 0;
        const concluidas = modulo.aulas.filter(a => a.concluida).length;
        return Math.round((concluidas / modulo.aulas.length) * 100);
    };

    // Mensagem amigável caso não existam módulos carregados
    if (!modulos.length) {
        return (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm text-center">
                Nenhum módulo encontrado para este curso.
            </div>
        );
    }

    return (
        <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[calc(100vh-120px)] pr-1">
            {modulos.map((modulo) => {
                const isOpen = !!modulosAbertos[modulo.id];
                const progresso = calcularProgressoModulo(modulo);

                return (
                    <div key={modulo.id} className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden transition-all">
                        {/* Cabeçalho do Módulo */}
                        <button
                            onClick={() => toggleModulo(modulo.id)}
                            className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-850 text-left transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-violet-400 border border-slate-700 shrink-0">
                                    {progresso}%
                                </div>
                                <span className="font-bold text-white text-sm tracking-tight">{modulo.titulo}</span>
                            </div>
                            {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </button>

                        {/* Lista de Aulas do Módulo */}
                        {isOpen && (
                            <div className="p-4 pt-1 border-t border-slate-800/60 bg-slate-950/40 space-y-1 relative">
                                {(modulo.aulas || []).map((aula, idx) => {
                                    const isAtiva = aula.id === aulaAtiva?.id;
                                    const isLast = idx === modulo.aulas.length - 1;

                                    return (
                                        <div key={aula.id} className="relative flex items-start gap-3 pl-2 py-2">
                                            {!isLast && (
                                                <div className="absolute left-[17px] top-[28px] bottom-[-8px] w-[2px] bg-slate-800 border-l border-dashed border-slate-700" />
                                            )}

                                            <div className="z-10 mt-0.5 shrink-0">
                                                {aula.concluida ? (
                                                    <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                ) : isAtiva ? (
                                                    <div className="w-5 h-5 rounded-full bg-violet-600 border-2 border-violet-400 animate-pulse" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-slate-950 border-2 border-slate-700" />
                                                )}
                                            </div>

                                            <button
                                                onClick={() => onSelecionarAula(aula)}
                                                className={`flex-1 text-left rounded-lg p-2 transition-all ${isAtiva
                                                        ? 'text-indigo-400 font-bold bg-violet-600/10'
                                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                                                    }`}
                                            >
                                                <p className="text-sm font-medium leading-snug">{aula.titulo}</p>
                                                {aula.duracao && (
                                                    <span className="text-[11px] text-slate-500">{aula.duracao}</span>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};