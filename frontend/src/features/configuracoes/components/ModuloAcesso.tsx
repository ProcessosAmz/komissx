// src/features/configuracoes/components/ModuloAcesso.tsx
import React from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    telas_fechamento: string[];
}

interface ModuloAcessoProps {
    users: User[];
    onUpdateUsers: (newUsers: User[]) => void;
}

// 1. Atualizado no escopo global para refletir exatamente os novos fechamentos
const TELAS_DISPONIVEIS = [
    { id: 'mensal_comercial', label: 'Mensal - Comercial' },
    { id: 'semanal_autonomo', label: 'Semanal - Autônomo' },
    { id: 'semanal_tecnico', label: 'Semanal - Técnico' },
    { id: 'mensal_pj', label: 'Mensal - PJ' }
];

export default function ModuloAcesso({ users, onUpdateUsers }: ModuloAcessoProps) {

    const handleTogglePermissao = (userId: number, telaId: string) => {
        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                const telasAtuais = user.telas_fechamento || [];
                const novasTelas = telasAtuais.includes(telaId)
                    ? telasAtuais.filter(id => id !== telaId)
                    : [...telasAtuais, telaId];

                return { ...user, telas_fechamento: novasTelas };
            }
            return user;
        });

        onUpdateUsers(updatedUsers);
    };

    return (
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Controle de Acesso ao Hub</h3>
                <p className="text-xs text-slate-400">Gerencie quais fechamentos cada operador pode visualizar.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
                        <tr>
                            <th className="px-4 py-3">Usuário</th>
                            {TELAS_DISPONIVEIS.map(tela => (
                                <th key={tela.id} className="px-4 py-3 text-center">{tela.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-200">{user.name}</div>
                                    <div className="text-[10px] text-slate-500">{user.email}</div>
                                </td>
                                {TELAS_DISPONIVEIS.map(tela => {
                                    const temAcesso = user.telas_fechamento?.includes(tela.id);
                                    return (
                                        <td key={tela.id} className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={temAcesso || false}
                                                onChange={() => handleTogglePermissao(user.id, tela.id)}
                                                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-500 cursor-pointer"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}