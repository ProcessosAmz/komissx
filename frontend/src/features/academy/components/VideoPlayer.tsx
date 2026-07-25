import React, { useState, useEffect } from 'react';
import { Aula } from '../types';
import { PdfReader } from './PdfReader';
import { PlayCircle, FileText, CheckCircle } from 'lucide-react';

// 1. Corrigido a Interface para aceitar o que a AcademyPage realmente envia
interface VideoPlayerProps {
    aula: Aula;
    cursoId?: string;
    onConcluir?: (cursoId: string, aulaId: string) => void;
    loading?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    aula,
    cursoId,
    onConcluir,
    loading
}) => {
    // Estado para o usuário alternar entre o Vídeo e o PDF se a aula possuir ambos
    const [abaAtiva, setAbaAtiva] = useState<'video' | 'pdf'>(
        aula?.materialPdf ? 'pdf' : 'video'
    );

    // Atualiza a aba caso o usuário mude de aula na lista lateral
    useEffect(() => {
        setAbaAtiva(aula?.materialPdf ? 'pdf' : 'video');
    }, [aula]);

    // Salvaguarda simples: se a aula por algum motivo sumir, não quebra a tela
    if (!aula) {
        return <div className="text-slate-400 p-8">Nenhuma aula selecionada.</div>;
    }

    return (
        <div className="space-y-4">
            {/* Cabeçalho da Aula (Título e Botão Concluir) */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                <div>
                    <h2 className="text-xl font-bold text-white">{aula.titulo}</h2>
                    <p className="text-sm text-slate-400 mt-1">{aula.descricao}</p>
                </div>

                {/* Botão de Concluir Aula integrado da sua página principal */}
                {onConcluir && cursoId && (
                    <button
                        onClick={() => onConcluir(cursoId, aula.id)}
                        disabled={loading || aula.concluida}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${aula.concluida
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                                : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50'
                            }`}
                    >
                        <CheckCircle size={16} />
                        {loading ? 'Processando...' : aula.concluida ? 'Aula Concluída' : 'Marcar como Concluída'}
                    </button>
                )}
            </div>

            {/* Seletores se houver PDF disponível além do vídeo */}
            {aula.materialPdf && (
                <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
                    <button
                        onClick={() => setAbaAtiva('video')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${abaAtiva === 'video'
                                ? 'bg-violet-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <PlayCircle size={16} /> Videoaula
                    </button>
                    <button
                        onClick={() => setAbaAtiva('pdf')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${abaAtiva === 'pdf'
                                ? 'bg-violet-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <FileText size={16} /> Ebook / Material PDF
                    </button>
                </div>
            )}

            {/* Renderização Condicional (Vídeo ou Ebook) */}
            {abaAtiva === 'pdf' && aula.materialPdf ? (
                <PdfReader pdfUrl={aula.materialPdf} />
            ) : (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
                    {aula.youtubeId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${aula.youtubeId}`}
                            title={aula.titulo}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                            Vídeo indisponível para esta aula.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};