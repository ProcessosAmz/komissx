import React from 'react';
import { Curso, Aula } from '../types';

interface AulaSidebarProps {
    curso: Curso;
    aulaAtiva: Aula;
    onSelecionarAula: (aula: Aula) => void;
}

export const AulaSidebar: React.FC<AulaSidebarProps> = ({ curso, aulaAtiva, onSelecionarAula }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-[calc(100vh-250px)] md:h-auto overflow-y-auto">
            <h3 className="font-bold text-white text-lg border-b border-slate-800 pb-3 mb-4">
                Aulas do Curso
            </h3>
            <div className="space-y-2">
                {curso.aulas.map((aula) => {
                    const isAtiva = aula.id === aulaAtiva.id;
                    return (
                        <button
                            key={aula.id}
                            onClick={() => onSelecionarAula(aula)}
                            className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between gap-3 text-sm ${isAtiva
                                    ? 'bg-violet-600/20 border border-violet-500/40 text-violet-200'
                                    : 'bg-slate-950/40 border border-transparent hover:bg-slate-800/40 text-slate-400 hover:text-white'
                                }`}
                        >
                            <div className="flex flex-col gap-1 min-w-0">
                                <span className={`font-semibold line-clamp-1 ${isAtiva ? 'text-white' : ''}`}>
                                    {aula.ordem}. {aula.titulo}
                                </span>
                                <span className="text-xs text-slate-500">{aula.duracao}</span>
                            </div>

                            {aula.concluida && (
                                <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};