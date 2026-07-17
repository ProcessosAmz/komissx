import React from 'react';
import { TrilhaGrid } from '../features/academy/components/TrilhaGrid';
import { VideoPlayer } from '../features/academy/components/VideoPlayer';
import { AulaSidebar } from '../features/academy/components/AulaSidebar';
import { useAcademy } from '../features/academy/hooks/useAcademy';
import { mockTrilhas } from '../features/academy/mockData'; // Massa de testes local

export default function AcademyPage() {
    // Pegue o Tenant atual injetado globalmente (ex: context do multi-tenant)
    const currentTenant = 'AMAZONET';

    const {
        cursoAtivo,
        aulaAtiva,
        loadingProgresso,
        selecionarCurso,
        selecionarAula,
        marcarComoConcluida,
        fecharCurso,
    } = useAcademy(currentTenant);

    if (cursoAtivo && aulaAtiva) {
        return (
            <div className="p-6 bg-slate-950 min-h-screen text-white space-y-6">
                <button
                    onClick={fecharCurso}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg"
                >
                    ← Voltar para as Trilhas
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <VideoPlayer
                            aula={aulaAtiva}
                            cursoId={cursoAtivo.id}
                            onConcluir={marcarComoConcluida}
                            loading={loadingProgresso}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <AulaSidebar
                            curso={cursoAtivo}
                            aulaAtiva={aulaAtiva}
                            onSelecionarAula={selecionarAula}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 bg-slate-950 min-h-screen">
            <div className="p-6 pb-0">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">KomissX Academy</h1>
                <p className="text-slate-400 text-sm">Capacitação focada em evolução profissional para ISPs</p>
            </div>
            <TrilhaGrid trilhas={mockTrilhas} onSelecionarCurso={selecionarCurso} />
        </div>
    );
}