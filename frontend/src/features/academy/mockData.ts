import { Trilha } from './types';

export const mockTrilhas: Trilha[] = [
    {
        id: "trilha-comercial",
        nome: "Trilha Comercial - Vendas ISPs",
        descricao: "Técnicas de abordagem, contorno de objeções e estratégias para bater metas de novos assinantes.",
        cursos: [
            {
                id: "curso-prospeccao",
                titulo: "Prospecção Ativa de Clientes",
                descricao: "Como abordar clientes PAP (Porta a Porta) e por telefone mapeando a concorrência.",
                imagemCapa: "https://images.unsplash.com/photo-1552581234-2612b75d8953?q=80&w=600",
                categoria: "Comercial",
                aulas: [
                    {
                        id: "aula-com-1",
                        titulo: "Introdução à abordagem em Condomínios",
                        descricao: "Passo a passo para passar pelo síndico e mapear oportunidades internas.",
                        duracao: "08:15",
                        youtubeId: "dQw4w9WgXcQ", // Substitua pelos IDs reais dos seus vídeos do YouTube
                        ordem: 1,
                        concluida: false
                    },
                    {
                        id: "aula-com-2",
                        titulo: "Quebrando a objeção de preço alto",
                        descricao: "Como ancorar valor demonstrando a estabilidade da Fibra Óptica vs Rádio/Cabo.",
                        duracao: "12:40",
                        youtubeId: "dQw4w9WgXcQ",
                        ordem: 2,
                        concluida: false
                    }
                ]
            }
        ]
    },
    {
        id: "trilha-tecnica",
        nome: "Trilha Técnica - Instalação e Reparo",
        descricao: "Padrões de fusão de fibra, boas práticas em CTO e configuração de ONUs/Roteadores.",
        cursos: [
            {
                id: "curso-fibra",
                titulo: "Padrão de Atendimento Técnico de Campo",
                descricao: "Garantindo a melhor experiência de instalação dentro da casa do assinante.",
                imagemCapa: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=600",
                categoria: "Tecnico",
                aulas: [
                    {
                        id: "aula-tec-1",
                        titulo: "Leitura de Potência na CTO e Fusão Perfeita",
                        descricao: "Identificando atenuações excessivas antes de passar o drop para o cliente.",
                        duracao: "15:20",
                        youtubeId: "dQw4w9WgXcQ",
                        ordem: 1,
                        concluida: false
                    }
                ]
            }
        ]
    },
    {
        id: "trilha-cobranca",
        nome: "Trilha de Cobrança e Retenção",
        descricao: "Técnicas de negociação preventiva e renegociação de faturas vencidas para reduzir o Churn.",
        cursos: [
            {
                id: "curso-acordos",
                titulo: "Negociação de Débitos Eficiente",
                descricao: "Como atingir as faixas superiores de bônus por acordos fechados.",
                imagemCapa: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600",
                categoria: "Cobranca",
                aulas: [
                    {
                        id: "aula-cob-1",
                        titulo: "Abordagem Empática e Firme para Inadimplentes",
                        descricao: "Regras de ouro para fechar promessas de pagamento no primeiro contato.",
                        duracao: "10:05",
                        youtubeId: "dQw4w9WgXcQ",
                        ordem: 1,
                        concluida: false
                    }
                ]
            }
        ]
    }
];