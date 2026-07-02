import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Target,
    GitBranch,
    Wallet,
    ShieldCheck,
    ChevronsLeft,
    ChevronsRight,
    Bell,
} from 'lucide-react';

import { Logo } from '../common/Logo';

const NAV_ITEMS = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/equipes', label: 'Equipes', icon: Users },
    { to: '/admin/metas', label: 'Metas', icon: Target },
    { to: '/admin/motor-de-regras', label: 'Motor de Regras', icon: GitBranch },
    { to: '/admin/fechamentos', label: 'Fechamentos', icon: Wallet },
    { to: '/admin/auditoria', label: 'Auditoria', icon: ShieldCheck },
];

interface StoredUser {
    name: string;
    email: string;
    role: string;
    tenantId: string;
}

// ==========================================
// COMPONENTE: HEADER (Integrado e Alinhado)
// ==========================================
function Header({ user }: { user: StoredUser }) {
    return (
        <header className="w-full h-16 bg-[#090d16]/80 border-b border-slate-900/80 px-6 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
            {/* Esquerda: Identificação da Seção */}
            <div className="flex flex-col">
                <h2 className="text-xs sm:text-[13px] font-semibold text-slate-200 uppercase tracking-wider">
                    Plataforma de Comissões
                </h2>
                <span className="hidden sm:inline-block text-[10px] text-slate-500 font-medium">
                    Regras de Negócio para Empresas
                </span>
            </div>

            {/* Direita: Notificações + Perfil */}
            <div className="flex items-center gap-4">
                <button className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-900/50 cursor-pointer relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </button>

                <div className="flex items-center gap-2.5 border-l border-slate-900 pl-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-semibold text-slate-300 leading-none">
                            {user?.name || 'Usuário'}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">
                            {user?.role || 'User'}
                        </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-400/20 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}

// ==========================================
// COMPONENTE: FOOTER
// ==========================================
function Footer() {
    return (
        <footer className="w-full bg-[#030712] border-t border-slate-900/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 mt-auto">
            <div className="text-center sm:text-left space-y-0.5">
                <p>&copy; 2026 <span className="text-slate-400 font-medium">KomissX</span>.</p>
                <p className="text-[10px] text-slate-600">Desenvolvido por Ketlyn Athan &middot; Todos os direitos reservados.</p>
            </div>

            <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800/50 px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                Mecanismo de regras v1.0.4
            </div>
        </footer>
    );
}

// ==========================================
// LAYOUT PRINCIPAL (Com Sidebar Embutida)
// ==========================================
export function DefaultLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState<StoredUser | null>(null);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('komissx_user');

        if (!stored) {
            navigate('/autenticacao');
            return;
        }

        try {
            // CORREÇÃO CRUCIAL: Preenche o estado do usuário ao recarregar a página!
            const parsedUser = JSON.parse(stored);
            setUser(parsedUser);
        } catch (error) {
            // Se o dado guardado estiver quebrado, limpa o lixo e desloga de vez
            localStorage.removeItem('komissx_user');
            navigate('/autenticacao');
        }
    }, [navigate]);

    // Previne tela em branco enquanto o useEffect lê o localStorage no F5
    if (!user) return null;

    return (
        <div className="min-h-screen flex bg-[#030712] text-slate-100 antialiased selection:bg-violet-500/30">

            {/* SIDEBAR EMBUTIDA */}
            <aside
                className={`h-screen sticky top-0 shrink-0 bg-[#090d16] border-r border-slate-900 flex flex-col transition-all duration-200 z-50 ${collapsed ? 'w-[68px]' : 'w-60'
                    }`}
            >
                {/* Topo da Sidebar: Logo + Toggle */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-900">
                    {!collapsed ? (
                        <Logo className="h-4 w-auto" showText={true} />
                    ) : (
                        <div className="w-full flex justify-center">
                            <Logo className="h-5 w-auto" showText={false} />
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={() => setCollapsed(true)}
                            className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                            aria-label="Recolher menu"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Botão de expansão isolado quando colapsado */}
                {collapsed && (
                    <div className="flex justify-center py-2 border-b border-slate-950">
                        <button
                            type="button"
                            onClick={() => setCollapsed(false)}
                            className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                            aria-label="Expandir menu"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Links de navegação */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors relative ${isActive
                                    ? 'bg-violet-500/10 text-violet-300'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-violet-500" />
                                    )}
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {!collapsed && <span className="truncate">{label}</span>}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* PAINEL CONTEÚDO (Direita) */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                <Header user={user} />

                {/* Área dinâmica das sub-rotas */}
                <main className="flex-1 bg-[#030712]">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}