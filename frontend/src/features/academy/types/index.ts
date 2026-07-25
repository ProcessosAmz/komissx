export interface Aula {
    id: string;
    ordem: number;
    titulo: string;
    descricao?: string;
    duracao: string;
    youtubeId?: string;
    youtubeUrl?: string;
    thumbnail?: string;
    materialPdf?: string | null;
    concluida: boolean;
    // Tópicos em destaque no vídeo
    topicos?: string[];
    notasGuiadas?: string[];
}

export interface Modulo {
    id: string;
    titulo: string;
    ordem: number;
    aulas: Aula[];
}

export interface Curso {
    id: string;
    titulo: string;
    descricao: string;
    imagemCapa: string;
    categoria: string;
    instrutor: string;
    nivel: string;
    cargaHoraria: string;
    status: string;
    modulos: Modulo[]; // Alterado de aulas[] para modulos[]
}

export interface Trilha {
    id: string;
    nome: string;
    descricao: string;
    icone: string;
    cor: string;
    ordem: number;
    cursos: Curso[];
}
export interface ProgressoPayload {
    aulaId: string;
    cursoId: string;
    moduloId?: string; // Incluído para dar suporte à nova estrutura por módulos
    tenant: 'AMAZONET' | 'MANIA';
}