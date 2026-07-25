import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

// Configura o worker do pdfjs utilizando a CDN oficial recomendada pela biblioteca
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
    pdfUrl: string;
}

export const PdfReader: React.FC<PdfReaderProps> = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    const mudarPagina = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const novaPagina = prevPageNumber + offset;
            if (numPages && novaPagina >= 1 && novaPagina <= numPages) {
                return novaPagina;
            }
            return prevPageNumber;
        });
    };

    const toggleFullscreen = () => {
        const elemento = document.getElementById('pdf-container-ebook');
        if (!elemento) return;

        if (!document.fullscreenElement) {
            elemento.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Erro ao ativar tela cheia: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Escuta a tecla ESC ou fechamento de tela cheia nativo do navegador
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div
            id="pdf-container-ebook"
            className={`flex flex-col items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'w-screen h-screen p-6 fixed inset-0 z-50 justify-center' : 'w-full min-h-[600px] p-4 relative'
                }`}
        >
            {/* Barra de Ferramentas / Controles superiores estilo Ebook */}
            <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 backdrop-blur-md p-3 rounded-lg mb-4 text-sm z-10">

                {/* Paginação */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => mudarPagina(-1)}
                        disabled={pageNumber <= 1}
                        className="p-1.5 rounded-md bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 disabled:opacity-30 disabled:hover:bg-slate-950"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-slate-300 min-w-[70px] text-center font-medium">
                        Pág. {pageNumber} de {numPages || '--'}
                    </span>
                    <button
                        onClick={() => mudarPagina(1)}
                        disabled={numPages ? pageNumber >= numPages : true}
                        className="p-1.5 rounded-md bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 disabled:opacity-30 disabled:hover:bg-slate-950"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Controles de Zoom */}
                <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-md border border-slate-800/60">
                    <button
                        onClick={() => setScale(prev => Math.max(prev - 0.2, 0.6))}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Diminuir Zoom"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-xs text-slate-400 w-12 text-center font-mono">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={() => setScale(prev => Math.min(prev + 0.2, 2.0))}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Aumentar Zoom"
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>

                {/* Botão Tela Cheia */}
                <button
                    onClick={toggleFullscreen}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
                >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Modo Leitura / Tela Cheia'}</span>
                </button>
            </div>

            {/* Renderização da Página do PDF */}
            <div className={`flex-1 overflow-auto w-full flex justify-center custom-scrollbar p-2 ${isFullscreen ? 'max-h-[calc(100vh-100px)]' : 'max-h-[650px]'
                }`}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
                            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Carregando material didático...</span>
                        </div>
                    }
                    error={
                        <div className="text-red-400 text-sm p-8 border border-red-900/30 bg-red-950/20 rounded-lg">
                            Não foi possível carregar o arquivo PDF configurado nesta aula.
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        className="shadow-2xl border border-slate-800 rounded-sm bg-white"
                    />
                </Document>
            </div>

            {/* Atalhos para passar folha clicando nas bordas invisíveis (Garante sensação de ebook) */}
            {!isFullscreen && numPages && (
                <>
                    {pageNumber > 1 && (
                        <div
                            onClick={() => mudarPagina(-1)}
                            className="absolute left-0 top-24 bottom-0 w-12 cursor-w-resize group flex items-center justify-start pl-2 bg-gradient-to-r from-slate-950/0 to-transparent hover:from-slate-950/40 transition-all"
                        >
                            <ChevronLeft size={24} className="opacity-0 group-hover:opacity-100 text-violet-400 transition-opacity" />
                        </div>
                    )}
                    {pageNumber < numPages && (
                        <div
                            onClick={() => mudarPagina(1)}
                            className="absolute right-0 top-24 bottom-0 w-12 cursor-e-resize group flex items-center justify-end pr-2 bg-gradient-to-l from-slate-950/0 to-transparent hover:from-slate-950/40 transition-all"
                        >
                            <ChevronRight size={24} className="opacity-0 group-hover:opacity-100 text-violet-400 transition-opacity" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};