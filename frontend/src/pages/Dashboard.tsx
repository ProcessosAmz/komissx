import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">

            {/* 1. CABEÇALHO GLOBAL (Aproveitado de forma isolada) */}
            <Header tenantName="Amazonet" userName="Pedro Alencar" userRole="Financeiro" />

            {/* 2. ÁREA DE CONTEÚDO PRINCIPAL (Dinamismo da View) */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Placeholder que representa o miolo das telas (Grid de Kanban, BI, etc.) */}
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6 min-h-[500px]">
                    {children}
                </div>

            </main>

            {/* 3. RODAPÉ GLOBAL (Aproveitado de forma isolada) */}
            <Footer />

        </div>
    );
};