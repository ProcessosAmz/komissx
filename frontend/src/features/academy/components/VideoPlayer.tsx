import React from 'react';
import { Aula, Curso } from '../types';

interface VideoPlayerProps {
    aula: Aula;
    cursoId: string;
    onConcluir: (aulaId: string, cursoId: string) => Promise<void>;
    loading: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ aula, cursoId, onConcluir, loading }) => {
    return (
        <div className="flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            {/* Container Proporcional 16:9 */}
            <div className="relative aspect-video bg-black w-full">
                <iframe
                    src={`https://www.youtube.com/embed/${aula.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                    title={aula.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>

            {/* Info & Ações */}
            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold text-white">{aula.titulo}</h1>
                    <p className="text-sm text-slate-400">{aula.descricao || 'Sem descrição cadastrada para esta aula.'}</p>
                </div>

                <button
                    onClick={() => onConcluir(aula.id, cursoId)}
                    disabled={aula.concluida || loading}
                    className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shrink-0 ${aula.concluida
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 active:scale-95'
                        }`}
                >
                    {aula.concluida ? (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Aula Concluída
                        </>
                    ) : loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Marcar como Concluída'
                    )}
                </button>
            </div>
        </div>
    );
};