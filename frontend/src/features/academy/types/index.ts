export interface Aula {
    id: string;
    titulo: string;
    descricao?: string;
    duracao: string; // Ex: "12:30"
    youtubeId: string; // ID do vídeo para renderizar no player
    ordem: number;
    concluida: boolean;
}

export interface Curso {
    id: string;
    titulo: string;
    descricao: string;
    imagemCapa: string;
    categoria: 'Comercial' | 'Tecnico' | 'Qualidade' | 'SPT' | 'Cobranca' | 'Lideranca';
    aulas: Aula[];
}

export interface Trilha {
    id: string;
    nome: string;
    descricao: string;
    cursos: Curso[];
}

export interface ProgressoPayload {
    aulaId: string;
    cursoId: string;
    tenant: 'AMAZONET' | 'MANIA';
}