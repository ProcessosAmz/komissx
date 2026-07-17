import React from 'react';
import { Trilha, Curso } from '../types';

interface TrilhaGridProps {
    trilhas: Trilha[];
    onSelecionarCurso: (curso: Curso) => void;
}

export const TrilhaGrid: React.FC<TrilhaGridProps> = ({ trilhas, onSelecionarCurso }) => {
    return (
        <div className="space-y-10 p-6 bg-slate-950 text-white min-h-screen">
            {trilhas.map((trilha) => (
                <div key={trilha.id} className="space-y-4">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-100">{trilha.nome}</h2>
                        <p className="text-sm text-slate-400">{trilha.descricao}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {trilha.cursos.map((curso) => (
                            <div
                                key={curso.id}
                                onClick={() => onSelecionarCurso(curso)}
                                className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-900 border border-slate-800 transition-all duration-300 hover:scale-105 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
                            >
                                {/* Capa do Curso */}
                                <div className="aspect-video w-full overflow-hidden bg-slate-950">
                                    <img
                                        src={curso.imagemCapa || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'}
                                        alt={curso.titulo}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>

                                {/* Detalhes */}
                                <div className="p-4 space-y-2">
                                    <span className="inline-flex items-center rounded-full bg-violet-400/10 px-2.5 py-0.5 text-xs font-medium text-violet-400 ring-1 ring-inset ring-violet-400/25">
                                        {curso.categoria}
                                    </span>
                                    <h3 className="font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                                        {curso.titulo}
                                    </h3>
                                    <p className="text-xs text-slate-400 line-clamp-2">
                                        {curso.descricao}
                                    </p>

                                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60">
                                        <span>{curso.aulas.length} aulas</span>
                                        <span>Modo ISP Academy</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};