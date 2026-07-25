import { useState } from 'react';
import { Aula, Curso, ProgressoPayload } from '../types';

export function useAcademy(tenant: 'AMAZONET' | 'MANIA') {
    const [cursoAtivo, setCursoAtivo] = useState<Curso | null>(null);
    const [aulaAtiva, setAulaAtiva] = useState<Aula | null>(null);
    const [loadingProgresso, setLoadingProgresso] = useState(false);

    // Chave única por Tenant no localStorage para salvar o progresso
    const STORAGE_KEY = `@academy:progresso:${tenant}`;

    // Helper para buscar as aulas concluídas salvas no JSON do localStorage
    const getAulasConcluidas = (): string[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    };

    const selecionarCurso = (curso: Curso) => {
        const concluidas = getAulasConcluidas();

        // Aplica o status de concluído salvo localmente nas aulas do curso
        const cursoComProgresso: Curso = {
            ...curso,
            modulos: (curso.modulos || []).map((modulo) => ({
                ...modulo,
                aulas: (modulo.aulas || []).map((aula) => ({
                    ...aula,
                    concluida: concluidas.includes(aula.id),
                })),
            })),
        };

        setCursoAtivo(cursoComProgresso);

        // Define a primeira aula com o estado atualizado
        const primeiraAula = cursoComProgresso?.modulos?.[0]?.aulas?.[0] || null;
        setAulaAtiva(primeiraAula);
    };

    const selecionarAula = (aula: Aula) => {
        setAulaAtiva(aula);
    };

    const marcarComoConcluida = async (aulaId: string, cursoId: string) => {
        if (!aulaAtiva) return;
        setLoadingProgresso(true);

        try {
            // 1. Identifica o módulo correspondente para montar o payload
            const moduloAtual = cursoAtivo?.modulos?.find((m) =>
                m.aulas?.some((a) => a.id === aulaId)
            );

            const payload: ProgressoPayload = {
                aulaId,
                cursoId,
                moduloId: moduloAtual?.id,
                tenant,
            };

            // 2. Salva localmente em formato JSON no localStorage (simula o DB)
            const concluidas = getAulasConcluidas();
            if (!concluidas.includes(aulaId)) {
                concluidas.push(aulaId);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(concluidas));
            }

            console.log('[LMS Storage] Progresso armazenado com sucesso:', payload);

            // 3. Atualiza os estados do React
            if (cursoAtivo) {
                const modulosAtualizados = (cursoAtivo.modulos || []).map((modulo) => ({
                    ...modulo,
                    aulas: (modulo.aulas || []).map((aula) =>
                        aula.id === aulaId ? { ...aula, concluida: true } : aula
                    ),
                }));

                setCursoAtivo({ ...cursoAtivo, modulos: modulosAtualizados });
                setAulaAtiva((prev) => (prev ? { ...prev, concluida: true } : null));
            }
        } catch (error) {
            console.error('Erro ao armazenar progresso no JSON local:', error);
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
        fecharCurso: () => {
            setCursoAtivo(null);
            setAulaAtiva(null);
        },
    };
}