import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function DefaultLayout() {
  return (
    // Configura o contêiner flex vertical ocupando toda a altura da tela (min-h-screen)
    // para garantir que o Footer fique sempre preso na base (Sticky Footer)
    <div className="min-h-screen bg-[#030712] flex flex-col font-sans antialiased relative selection:bg-indigo-500/30 selection:text-white">
      
      {/* 1. Grade Fixa Superior (Header com Grid) */}
      <Header />

      {/* 2. Área Conteúdo Dinâmico */}
      {/* O flex-1 garante que esta área empurre o rodapé para baixo se houver pouca informação */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 text-slate-100">
        
        {/* O Outlet é onde a sua página "Admin" (ou as futuras como equipes e metas) será renderizada de verdade! */}
        <Outlet />
        
      </main>

      {/* 3. Rodapé fixado na base */}
      <Footer />
    </div>
  );
}