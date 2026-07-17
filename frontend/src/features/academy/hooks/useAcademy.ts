import { useState } from 'react';
import { Aula, Curso, ProgressoPayload } from '../types';

export function useAcademy(tenant: 'AMAZONET' | 'MANIA') {
    const [cursoAtivo, setCursoAtivo] = useState<Curso | null>(null);
    const [aulaAtiva, setAulaAtiva] = useState<Aula | null>(null);
    const [loadingProgresso, setLoadingProgresso] = useState(false);

    const selecionarCurso = (curso: Curso) => {
        setCursoAtivo(curso);
        if (curso.aulas.length > 0) {
            setAulaAtiva(curso.aulas[0]);
        }
    };

    const selecionarAula = (aula: Aula) => {
        setAulaAtiva(aula);
    };

    const marcarComoConcluida = async (aulaId: string, cursoId: string) => {
        if (!aulaAtiva) return;
        setLoadingProgresso(true);

        try {
            // Simulação da chamada de API para o NestJS enviando o Tenant dinâmico
            const payload: ProgressoPayload = { aulaId, cursoId, tenant };

            const response = await fetch('/api/academy/progresso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenant, // Header para controle do multi-tenant no NestJS
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Falha ao salvar progresso');

            // Atualiza o estado visual da aula concluída localmente de forma otimista
            if (cursoAtivo) {
                const aulasAtualizadas = cursoAtivo.aulas.map((aula) =>
                    aula.id === aulaId ? { ...aula, concluida: true } : aula
                );
                setCursoAtivo({ ...cursoAtivo, aulas: aulasAtualizadas });
                setAulaAtiva({ ...aulaAtiva, concluida: true });
            }
        } catch (error) {
            console.error('Erro ao salvar progresso do LMS:', error);
        } finally {
            setLoadingProgresso(false);
        }
    };

    return {
        cursoAtivo,
        aulaAtiva,
        loadingProgresso,
        selecionarCurso,
        selecionarAula,
        marcarComoConcluida,
        fecharCurso: () => { setCursoAtivo(null); setAulaAtiva(null); }
    };
}