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
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#volumeFill)" />
            <path d={linePath} fill="none" stroke="#a5b4fc" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function StatusToggle({ active }: { active: boolean }) {
    const [on, setOn] = useState(active);

    return (
        <button
            type="button"
            onClick={() => setOn((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${on ? 'bg-violet-600' : 'bg-slate-700'}`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${on ? 'translate-x-6' : 'translate-x-1'}`}
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
            navigate('/autenticacao');
            return;
        }
        try {
            setUser(JSON.parse(stored));
        } catch {
            navigate('/autenticacao');
        }
    }, [navigate]);

    if (!user) return null;

    const filteredRules = RULES.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 min-w-0 px-4 sm:px-6 py-6 space-y-6 bg-[#030712]">
            {/* Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-slate-500 font-mono">
                    {user.role} / Configurações / <span className="text-slate-300">Motor de Regras</span>
                </p>

                <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-2xl text-sm">
                        Tenant: <span className="font-medium text-violet-400">{user.tenantId}</span>
                        <ChevronDown className="h-4 w-4" />
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-semibold">Configurações</h1>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Rules Table */}
                <div className="xl:col-span-5 bg-[#090d16] border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-medium">Selecione as regras</h2>
                            <button className="bg-violet-600 hover:bg-violet-500 px-5 py-2 rounded-2xl text-sm font-medium transition">
                                Configurar
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar regra..."
                                className="w-full bg-[#0a0f1c] border border-slate-700 rounded-2xl pl-11 py-3 text-sm focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-auto flex-1">
                        <table className="w-full">
                            <thead className="bg-[#05080f] sticky top-0">
                                <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-slate-800">
                                    <th className="pl-6 py-4 w-10"><input type="checkbox" className="rounded" /></th>
                                    <th className="text-left py-4">Nome <ArrowUpDown className="inline h-3 w-3" /></th>
                                    <th className="text-left py-4">Versão</th>
                                    <th className="text-right pr-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRules.map((rule) => (
                                    <tr key={rule.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition">
                                        <td className="pl-6 py-4"><input type="checkbox" className="rounded" /></td>
                                        <td className="py-4 text-sm">{rule.name}</td>
                                        <td className="py-4">
                                            <span className={`text-xs px-3 py-1 rounded-full font-mono ${rule.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                                {rule.version}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <StatusToggle active={rule.active} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rule Builder */}
                <div className="xl:col-span-4 bg-[#090d16] border border-slate-800 rounded-3xl flex flex-col">
                    <div className="p-5 border-b border-slate-800 flex items-start justify-between">
                        <div>
                            <h2 className="font-medium">Configuração de regra</h2>
                            <p className="text-xs text-slate-500 mt-1">Defina condições e ações</p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-6 flex-1">
                        <button className="w-full border border-dashed border-slate-700 hover:border-violet-500/50 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 text-slate-400 hover:text-violet-300 transition">
                            <Plus className="h-4 w-4" /> Adicionar condição inicial
                        </button>

                        <div className="bg-[#05080f] p-5 rounded-2xl space-y-4 text-sm">
                            <p><span className="text-violet-400 font-bold">SE</span> cliente ativo <span className="text-violet-400 font-bold">ENTÃO</span> pague 5% base</p>
                            <p><span className="text-violet-400 font-bold">E</span> plano upgrade <span className="text-violet-400 font-bold">ENTÃO</span> pague 5% adicional</p>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Fórmula matemática</label>
                            <textarea
                                rows={4}
                                placeholder="ex: base_commission * 1.05"
                                className="w-full bg-[#05080f] border border-slate-700 rounded-2xl p-4 text-sm font-mono resize-y focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium">Volume de processamento</h3>
                                <p className="text-xs text-slate-500">últimos 30 dias</p>
                            </div>
                            <RefreshCw className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="mt-6">
                            <Sparkline points={VOLUME_POINTS} />
                        </div>
                    </div>

                    <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6 flex-1 flex flex-col">
                        <h3 className="font-medium">Fila de processamento</h3>
                        <p className="text-xs text-slate-500">background job queue</p>

                        <div className="mt-auto flex items-center gap-3 bg-[#05080f] border border-slate-700 rounded-2xl px-4 py-3 text-sm text-emerald-400">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Nenhum job pendente
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}