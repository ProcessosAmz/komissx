import React from 'react';
import { Logo } from '../common/Logo';

interface HeaderProps {
    tenantName?: string;
    userName?: string;
    userRole?: string;
}

export const Header: React.FC<HeaderProps> = ({
    tenantName = "Amazonet",
    userName = "Pedro Alencar",
    userRole = "Financeiro"
}) => {
    return (
        <header className="w-full bg-slate-800 border-b border-slate-700/60 px-6 py-4 flex items-center justify-between shadow-md">
            {/* Lado Esquerdo: Marca Reutilizada */}
            <div className="flex items-center gap-6">
                <Logo variant="default" size="md" />
                <div className="h-5 w-px bg-slate-700 hidden sm:block" />
                {/* Badge Contextual de Tenant Multi-Empresa */}
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Tenant: {tenantName}
                </span>
            </div>

            {/* Lado Direito: Notificações, Perfil e Contexto do Usuário */}
            <div className="flex items-center gap-4">
                {/* Indicador de Sincronismo com HubSoft */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/40">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden md:inline">HubSoft API:</span> OK
                </div>

                {/* Botão de Notificações */}
                <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors relative">
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>

                <div className="h-5 w-px bg-slate-700" />

                {/* Perfil Simplificado */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{userName}</p>
                        <p className="text-xs text-slate-400">{userRole}</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm border border-indigo-400/20">
                        {userName.split(' ').map(n => n[0]).join('')}
                    </div>
                </div>
            </div>
        </header>
    );
};