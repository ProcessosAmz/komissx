import React from 'react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear(); // Renderiza dinamicamente o ano vigente

    return (
        <footer className="w-full bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            {/* Links de Legal & Compliance */}
            <div className="flex items-center gap-6 order-2 sm:order-1">
                <span>&copy; {currentYear} KomissX Enterprise.</span>
                <a href="#terms" className="hover:text-slate-300 transition-colors">Termos de Uso</a>
                <a href="#privacy" className="hover:text-slate-300 transition-colors">Segurança & LGPD</a>
            </div>

            {/* Status de Operação do Motor de Regras Core */}
            <div className="flex items-center gap-4 order-1 sm:order-2">
                <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-slate-400">Cálculos Auditados & Criptografados</span>
                </div>
                <span className="bg-slate-800 px-2.5 py-1 rounded text-[10px] font-mono tracking-wider uppercase text-slate-400">
                    v2.4-build.2026
                </span>
            </div>
        </footer>
    );
};