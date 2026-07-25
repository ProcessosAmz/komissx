import React from 'react';
import { Trilha, Curso } from '../types';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';

interface TrilhaGridProps {
    trilhas: Trilha[];
    onSelecionarCurso: (curso: Curso) => void;
}

export const TrilhaGrid: React.FC<TrilhaGridProps> = ({ trilhas = [], onSelecionarCurso }) => {
    // Helper seguro para calcular o total de aulas
    const getTotalAulas = (curso: Curso): number => {
        if (!curso?.modulos || !Array.isArray(curso.modulos)) return 0;
        return curso.modulos.reduce((acc, modulo) => {
            const qtdAulas = modulo?.aulas && Array.isArray(modulo.aulas) ? modulo.aulas.length : 0;
            return acc + qtdAulas;
        }, 0);
    };

    if (!trilhas || trilhas.length === 0) {
        return (
            <div className="p-6 text-center text-slate-400">
                Nenhuma trilha encontrada.
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {trilhas.map((trilha) => {
                const cursos = trilha?.cursos || [];

                return (
                    <div key={trilha.id} className="space-y-4">
                        {/* Cabeçalho da Trilha */}
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                            <div
                                className="w-3 h-8 rounded-full"
                                style={{ backgroundColor: trilha.cor || '#3b82f6' }}
                            />
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">{trilha.nome}</h2>
                                <p className="text-sm text-slate-400">{trilha.descricao}</p>
                            </div>
                        </div>

                        {/* Lista de Cursos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cursos.map((curso) => {
                                const totalAulas = getTotalAulas(curso);

                                return (
                                    <div
                                        key={curso.id}
                                        onClick={() => onSelecionarCurso(curso)}
                                        className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Capa */}
                                            <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                                                <img
                                                    src={curso.imagemCapa}
                                                    alt={curso.titulo}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-slate-300 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-800">
                                                    {curso.categoria}
                                                </span>
                                            </div>

                                            {/* Conteúdo */}
                                            <div className="p-4 space-y-2">
                                                <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                    {curso.titulo}
                                                </h3>
                                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                                    {curso.descricao}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rodapé do Card */}
                                        <div className="p-4 pt-0 border-t border-slate-800/40 mt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <BookOpen size={14} className="text-slate-500" />
                                                <span>{totalAulas} {totalAulas === 1 ? 'aula' : 'aulas'}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-slate-500" />
                                                <span>{curso.cargaHoraria}</span>
                                            </div>

                                            <div className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                                                <span>Acessar</span>
                                                <PlayCircle size={14} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};