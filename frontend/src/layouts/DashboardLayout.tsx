import * as React from 'react';
import { Header } from '../components/layout/Header';


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    // min-h-screen junto com flex-col força a página a ocupar 100% da viewport
    <div className="min-h-screen bg-[#030712] flex flex-col font-sans antialiased relative">
      
      {/* Cabeçalho superior com distribuição espacial */}
      <Header />

      {/* O flex-1 empurra o Footer obrigatoriamente para a base da tela */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      
    </div>
  );
}