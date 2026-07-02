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

function Header({ user }: { user: StoredUser }) {
    return (
        <header className="h-16 bg-[#090d16]/95 border-b border-slate-800 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
            <div>
                <h2 className="text-sm font-semibold tracking-wider">PLATAFORMA DE COMISSÕES</h2>
                <p className="text-[10px] text-slate-500 -mt-0.5">Regras de Negócio Inteligentes</p>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-[#090d16]" />
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-200">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{user.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
                        {user.name[0].toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}

function Footer() {
    return (
        <footer className="bg-[#05080f] border-t border-slate-800 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
                © 2026 <span className="text-slate-400">KomissX</span> • Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-1 rounded-full border border-slate-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Motor de Regras v1.0.4
            </div>
        </footer>
    );
}

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
            setUser(JSON.parse(stored));
        } catch {
            localStorage.removeItem('komissx_user');
            navigate('/autenticacao');
        }
    }, [navigate]);

    if (!user) return <div className="min-h-screen bg-[#030712]" />; // Loading fallback

    return (
        <div className="min-h-screen flex bg-[#030712] text-slate-100">
            {/* SIDEBAR */}
            <aside
                className={`h-screen bg-[#090d16] border-r border-slate-800 flex flex-col transition-all duration-300 z-50 ${collapsed ? 'w-16' : 'w-64'
                    }`}
            >
                <div className="h-16 border-b border-slate-800 flex items-center px-4">
                    {!collapsed ? (
                        <Logo showText={true} />
                    ) : (
                        <div className="mx-auto">
                            <Logo showText={false} />
                        </div>
                    )}

                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="ml-auto p-2 text-slate-400 hover:text-slate-200"
                        >
                            <ChevronsLeft className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="mx-auto mt-4 p-2 text-slate-400 hover:text-slate-200"
                    >
                        <ChevronsRight className="h-5 w-5" />
                    </button>
                )}

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group ${isActive
                                    ? 'bg-violet-500/10 text-violet-300'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className="h-5 w-5" />
                                    {!collapsed && <span>{label}</span>}
                                    {isActive && !collapsed && (
                                        <div className="ml-auto w-1 h-1 bg-violet-500 rounded-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-h-screen">
                <Header user={user} />

                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}