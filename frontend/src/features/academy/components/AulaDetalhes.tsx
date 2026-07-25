import React, { useState } from 'react';
import { Aula } from '../types';
import { Check, Star, Heart, Smile, Image as ImageIcon, Type } from 'lucide-react';

interface AulaDetalhesProps {
    aula: Aula;
    cursoId?: string;
    onConcluir?: (cursoId: string, aulaId: string) => void;
    loading?: boolean;
}

export const AulaDetalhes: React.FC<AulaDetalhesProps> = ({ aula, cursoId, onConcluir, loading }) => {
    const [abaAtiva, setAbaAtiva] = useState<'info' | 'comentarios'>('info');
    const [anotacao, setAnotacao] = useState('');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Coluna Esquerda: Informações e Conteúdo Guiado */}
            <div className="lg:col-span-2 space-y-6">
                {/* Barra do Título + Ações Rápidas */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{aula.titulo}</h1>

                    <div className="flex items-center gap-2">
                        {onConcluir && cursoId && (
                            <button
                                /* ✅ CORRIGIDO: aula.id em 1º, cursoId em 2º */
                                onClick={() => onConcluir(aula.id, cursoId)}
                                disabled={loading || aula.concluida}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${aula.concluida
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                                    }`}
                            >
                                <Check size={14} />
                                {aula.concluida ? 'Concluído' : 'Concluir'}
                            </button>
                        )}
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all">
                            <Heart size={14} /> Favoritar
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all">
                            <Star size={14} /> Avaliar
                        </button>
                    </div>
                </div>

                {/* Abas de Navegação Inferior */}
                <div className="flex gap-6 border-b border-slate-800">
                    <button
                        onClick={() => setAbaAtiva('info')}
                        className={`pb-3 text-sm font-semibold relative transition-colors ${abaAtiva === 'info' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Informações
                    </button>
                    <button
                        onClick={() => setAbaAtiva('comentarios')}
                        className={`pb-3 text-sm font-semibold relative transition-colors ${abaAtiva === 'comentarios' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Comentários
                    </button>
                </div>

                {/* Conteúdo da Aba */}
                {abaAtiva === 'info' ? (
                    <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
                        <p>{aula.descricao}</p>

                        {aula.topicos && aula.topicos.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-white text-base">O que você vai encontrar no vídeo</h3>
                                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                                    {aula.topicos.map((topico, idx) => (
                                        <li key={idx}>{topico}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {aula.notasGuiadas && aula.notasGuiadas.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h3 className="font-bold text-white text-base">Notas guiadas para acompanhar a aula</h3>
                                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                                    {aula.notasGuiadas.map((nota, idx) => (
                                        <li key={idx}>{nota}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-slate-400 text-sm py-4">Nenhum comentário enviado ainda.</div>
                )}
            </div>

            {/* Coluna Direita: Bloco de Anotações Interativo */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between min-h-[300px]">
                <div>
                    <h3 className="font-bold text-white text-base mb-3">Anotações</h3>
                    <textarea
                        value={anotacao}
                        onChange={(e) => setAnotacao(e.target.value)}
                        placeholder="Escreva suas anotações aqui"
                        className="w-full h-40 bg-transparent text-slate-200 placeholder-slate-500 text-sm focus:outline-none resize-none custom-scrollbar"
                    />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-2 text-slate-400">
                        <button className="p-1.5 hover:text-white rounded hover:bg-slate-800 transition-colors"><Type size={16} /></button>
                        <button className="p-1.5 hover:text-white rounded hover:bg-slate-800 transition-colors"><Smile size={16} /></button>
                        <button className="p-1.5 hover:text-white rounded hover:bg-slate-800 transition-colors"><ImageIcon size={16} /></button>
                    </div>
                    <button
                        onClick={() => alert('Anotação salva!')}
                        className="px-4 py-1.5 bg-slate-200 hover:bg-white text-slate-900 font-semibold text-xs rounded-lg transition-colors"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};