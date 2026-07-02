import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCw,
    ChevronDown,
    Search,
    Plus,
    MoreHorizontal,
    ArrowUpDown,
} from 'lucide-react';
import './Admin.css';

interface StoredUser {
    name: string;
    email: string;
    role: string;
    tenantId: string;
}

interface RuleRow {
    id: string;
    name: string;
    version: string;
    active: boolean;
}

const RULES: RuleRow[] = [
    { id: 'r1', name: 'Vendas Fibra 100MB', version: 'v2.3', active: true },
    { id: 'r2', name: 'Vendas Fibra 500MB', version: 'v2.3', active: true },
    { id: 'r3', name: 'Renovação Contrato', version: 'v1.8', active: false },
    { id: 'r4', name: 'Upsell Combo TV+Net', version: 'v1.1', active: true },
];

const VOLUME_POINTS = [8, 14, 10, 18, 15, 22, 19, 26, 21, 28, 24, 30];

function Sparkline({ points }: { points: number[] }) {
    const width = 220;
    const height = 64;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const step = width / (points.length - 1);

    const coords = points.map((p, i) => {
        const x = i * step;
        const y = height - ((p - min) / (max - min || 1)) * (height - 8) - 4;
        return [x, y] as const;
    });

    const linePath = coords
        .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
        .join(' ');

    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
            <defs>
                <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#volumeFill)" />
            <path d={linePath} fill="none" stroke="rgb(167 139 250)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function StatusToggle({ active }: { active: boolean }) {
    const [on, setOn] = useState(active);
    return (
        <button
            type="button"
            onClick={() => setOn((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${on ? 'bg-violet-500' : 'bg-slate-800'}`}
            aria-pressed={on}
            aria-label="Alternar status da regra"
        >
            <span
                className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                style={{ transform: on ? 'translateX(18px)' : 'translateX(4px)' }}
            />
        </button>
    );
}

export default function Admin() {
    const navigate = useNavigate();
    const [user, setUser] = useState<StoredUser | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('komissx_user');
        if (!stored) {
            navigate('/login');
            return;
        }
        try {
            setUser(JSON.parse(stored));
        } catch {
            navigate('/login');
        }
    }, [navigate]);

    if (!user) return null;

    const filteredRules = RULES.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 min-w-0 px-4 sm:px-6 py-6 space-y-5">
            {/* Breadcrumb + tenant selector */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500 font-mono">
                    {user.role === 'ADMIN' ? 'Admin' : user.role} / Configurações /{' '}
                    <span className="text-slate-300">Motor de Regras</span>
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors cursor-pointer"
                        aria-label="Atualizar"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[11px] font-medium px-3 py-1.5 rounded-full hover:bg-violet-500/15 transition-colors cursor-pointer"
                    >
                        Tenant: {user.tenantId}
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </div>
            </div>

            <h1 className="text-xl font-semibold text-slate-100">Configurações</h1>

            {/* Content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                {/* Selecione as regras */}
                <section className="xl:col-span-5 bg-[#090d16] border border-slate-900 rounded-xl flex flex-col">
                    <div className="p-4 border-b border-slate-900 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-medium text-slate-200">Selecione as regras</h2>
                            <button
                                type="button"
                                className="text-[11px] font-medium bg-violet-500 hover:bg-violet-400 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                Configurar
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar regra..."
                                className="w-full bg-[#030712] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/60"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-900">
                                    <th className="py-2.5 pl-4 pr-2 font-medium w-8">
                                        <input type="checkbox" className="rounded border-slate-700 bg-transparent" />
                                    </th>
                                    <th className="py-2.5 px-2 font-medium">
                                        <span className="inline-flex items-center gap-1">
                                            Nome <ArrowUpDown className="h-3 w-3" />
                                        </span>
                                    </th>
                                    <th className="py-2.5 px-2 font-medium">Versão</th>
                                    <th className="py-2.5 pr-4 pl-2 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRules.map((rule) => (
                                    <tr key={rule.id} className="border-b border-slate-900/70 last:border-0 hover:bg-slate-900/30 transition-colors">
                                        <td className="py-3 pl-4 pr-2">
                                            <input type="checkbox" className="rounded border-slate-700 bg-transparent" />
                                        </td>
                                        <td className="py-3 px-2 text-[12.5px] text-slate-200">{rule.name}</td>
                                        <td className="py-3 px-2">
                                            <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded ${rule.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                                {rule.version} ({rule.active ? 'Ativa' : 'Inativa'})
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 pl-2 text-right">
                                            <StatusToggle active={rule.active} />
                                        </td>
                                    </tr>
                                ))}
                                {filteredRules.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-[12px] text-slate-500">
                                            Nenhuma regra encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Configuração de regra */}
                <section className="xl:col-span-4 bg-[#090d16] border border-slate-900 rounded-xl flex flex-col">
                    <div className="p-4 border-b border-slate-900 flex items-start justify-between">
                        <div>
                            <h2 className="text-sm font-medium text-slate-200">Configuração de regra</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">Defina condições e ações da regra</p>
                        </div>
                        <button
                            type="button"
                            className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                            aria-label="Mais opções"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-1.5 border border-dashed border-slate-800 hover:border-violet-500/50 text-slate-400 hover:text-violet-300 text-[11.5px] font-medium py-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <Plus className="h-3.5 w-3.5" /> Adicionar condição inicial
                        </button>

                        <div className="bg-[#030712] border border-slate-900 rounded-lg p-3 space-y-2 text-[12px] leading-relaxed">
                            <p>
                                <span className="text-violet-400 font-semibold">SE</span>{' '}
                                <span className="text-slate-300">cliente ativo</span>{' '}
                                <span className="text-violet-400 font-semibold">ENTÃO</span>{' '}
                                <span className="text-slate-300">pague 5% de comissão base</span>
                            </p>
                            <p>
                                <span className="text-violet-400 font-semibold">E</span>{' '}
                                <span className="text-slate-300">plano upgrade</span>{' '}
                                <span className="text-violet-400 font-semibold">ENTÃO</span>{' '}
                                <span className="text-slate-300">pague 5% de comissão adicional</span>
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                                Fórmula matemática
                            </label>
                            <textarea
                                rows={3}
                                placeholder="ex: base_commission * 1.05"
                                className="w-full resize-none bg-[#030712] border border-slate-800 rounded-lg px-3 py-2 text-[12px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/60"
                            />
                        </div>
                    </div>
                </section>

                {/* Coluna direita: volume + fila */}
                <div className="xl:col-span-3 flex flex-col gap-5">
                    <section className="bg-[#090d16] border border-slate-900 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-medium text-slate-200">Volume de processamento</h2>
                                <p className="text-[11px] text-slate-500 mt-0.5">últimos 30 dias</p>
                            </div>
                            <button
                                type="button"
                                className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                                aria-label="Atualizar volume"
                            >
                                <RefreshCw className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="mt-3">
                            <Sparkline points={VOLUME_POINTS} />
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-600 font-mono">
                            <span>1 jun</span>
                            <span>30 jun</span>
                        </div>
                    </section>

                    <section className="bg-[#090d16] border border-slate-900 rounded-xl p-4 flex-1">
                        <div>
                            <h2 className="text-sm font-medium text-slate-200">Fila de processamento</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">background job queue</p>
                        </div>

                        <div className="mt-3 flex items-center gap-2 bg-[#030712] border border-slate-800/60 px-2.5 py-1.5 rounded-lg text-[10.5px] text-slate-500 font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            Nenhum job pendente
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}