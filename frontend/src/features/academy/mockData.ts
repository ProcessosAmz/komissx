import { Trilha } from './types';

export const mockTrilhas: Trilha[] = [
    {
        id: "trilha-comercial",
        nome: "Trilha Commercial",
        descricao: "Capacitação da equipe comercial da Amazonet | Mania.",
        icone: "briefcase",
        cor: "#2563eb",
        ordem: 1,
        cursos: [
            {
                id: "curso-auditoria-comercial",
                titulo: "Auditoria Comercial de Venda",
                descricao: "Curso destinado aos colaboradores do comercial de vendas.",
                imagemCapa: "/uploads/capas/Capa.png",
                categoria: "Comercial",
                instrutor: "Amazonet Academy",
                nivel: "Iniciante",
                cargaHoraria: "35 min",
                status: "PUBLICADO",
                modulos: [
                    {
                        id: "mod-auditoria-1",
                        titulo: "Processos de Auditoria de Vendas",
                        ordem: 1,
                        aulas: [
                            {
                                id: "aula-01",
                                ordem: 1,
                                titulo: "Abrindo atendimento",
                                descricao: "Aprenda como iniciar corretamente um atendimento de Auditoria Comercial.",
                                youtubeId: "jsmIjbc8Ct8",
                                youtubeUrl: "https://youtu.be/jsmIjbc8Ct8",
                                thumbnail: "/uploads/aulas/auditoria-comercial/01.png",
                                duracao: "08:00",
                                materialPdf: null,
                                concluida: false,
                                topicos: [
                                    "Abertura correta do sistema",
                                    "Identificação inicial do cliente",
                                    "Checklist de pré-atendimento"
                                ],
                                notasGuiadas: [
                                    "Certifique-se de validar o CPF antes da abertura.",
                                    "Anotar protocolo gerado no sistema de CRM."
                                ]
                            },
                            {
                                id: "aula-02",
                                ordem: 2,
                                titulo: "Ajustando o Filtro",
                                descricao: "Configuração correta dos filtros utilizados durante a auditoria comercial.",
                                youtubeId: "-ABhzRVStsI",
                                youtubeUrl: "https://youtu.be/-ABhzRVStsI",
                                thumbnail: "/uploads/aulas/auditoria-comercial/02.png",
                                duracao: "06:30",
                                materialPdf: null,
                                concluida: false,
                                topicos: [
                                    "Filtros de regionalização",
                                    "Seleção por tipo de contrato"
                                ]
                            },
                            {
                                id: "aula-03",
                                ordem: 3,
                                titulo: "Corrigindo Não Conformidade",
                                descricao: "Procedimentos para identificar e corrigir não conformidades encontradas durante a auditoria.",
                                youtubeId: "xrsElO3rur4",
                                youtubeUrl: "https://youtu.be/xrsElO3rur4",
                                thumbnail: "/uploads/aulas/auditoria-comercial/03.png",
                                duracao: "09:20",
                                materialPdf: null,
                                concluida: false
                            },
                            {
                                id: "aula-04",
                                ordem: 4,
                                titulo: "Fechando atendimento",
                                descricao: "Como finalizar corretamente um atendimento, tratando casos de desistência e inviabilidade.",
                                youtubeId: "IhB1z19Q2OY",
                                youtubeUrl: "https://youtu.be/IhB1z19Q2OY",
                                thumbnail: "/uploads/aulas/auditoria-comercial/04.png",
                                duracao: "10:15",
                                materialPdf: null,
                                concluida: false
                            }
                        ]
                    }
                ]
            },
            {
                id: "curso-prospeccao",
                titulo: "Venda",
                descricao: "O Conselheiro",
                imagemCapa: "/uploads/capas/vendas.png",
                categoria: "Comercial",
                instrutor: "O conselheiro",
                nivel: "Iniciante",
                cargaHoraria: "11 min",
                status: "PUBLICADO",
                modulos: [
                    {
                        id: "mod-vendas-1",
                        titulo: "Técnicas Avançadas de Prospecção",
                        ordem: 1,
                        aulas: [
                            {
                                id: "aula-com-1",
                                ordem: 1,
                                titulo: "APRENDA A VENDER",
                                descricao: "APRENDA A VENDER IGUAL O LOBO DE WALL STREET",
                                duracao: "11:19",
                                youtubeId: "cIj2xhOEsdU",
                                youtubeUrl: "https://www.youtube.com/watch?v=cIj2xhOEsdU",
                                thumbnail: "/uploads/aulas/prospeccao/01.png",
                                materialPdf: null,
                                concluida: false
                            },
                            {
                                id: "aula-com-2",
                                ordem: 2,
                                titulo: "Lide com Objeções em Vendas",
                                descricao: "Lide com Objeções em Vendas: 7 Técnicas Infalíveis | Gilberto Augusto",
                                duracao: "15:40",
                                youtubeId: "zrsh5WpWjrM",
                                youtubeUrl: "https://www.youtube.com/watch?v=zrsh5WpWjrM",
                                thumbnail: "/uploads/aulas/prospeccao/02.png",
                                materialPdf: null,
                                concluida: false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "trilha-tecnica",
        nome: "Trilha Técnica - Instalação e Reparo",
        descricao: "Capacitação da equipe Técnica da Amazonet | Mania.",
        icone: "wrench",
        cor: "#dc2626",
        ordem: 2,
        cursos: [
            {
                id: "curso-fibra",
                titulo: "Padrão de Atendimento Técnico de Campo",
                descricao: "Garantindo a melhor experiência de instalação dentro da casa do assinante.",
                imagemCapa: "/uploads/capas/Trilha tecnico.png",
                categoria: "Tecnico",
                instrutor: "Amazonet Academy",
                nivel: "Intermediário",
                cargaHoraria: "15 min",
                status: "PUBLICADO",
                modulos: [
                    {
                        id: "mod-tec-1",
                        titulo: "Infraestrutura e Campo",
                        ordem: 1,
                        aulas: [
                            {
                                id: "aula-tec-1",
                                ordem: 1,
                                titulo: "Leitura de Potência na CTO e Fusão Perfeita",
                                descricao: "Identificando atenuações excessivas antes de passar o drop para o cliente.",
                                duracao: "15:20",
                                youtubeId: "AHjnuFBi8Ts",
                                youtubeUrl: "https://youtu.be/AHjnuFBi8Ts",
                                thumbnail: "/uploads/aulas/tecnico/01.png",
                                materialPdf: "/uploads/manuais/tecnico/manual_atendimento_campo.pdf",
                                concluida: false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "trilha-qualidade",
        "nome": "Trilha de Qualidade (Auditorias)",
        "descricao": "Capacitação da equipe de Qualidade da Amazonet | Mania.",
        "icone": "credit-card",
        "cor": "#16a34a",
        "ordem": 3,
        "cursos": [
            {
                "id": "auditorias",
                "titulo": "Auditorias",
                "descricao": "Como identificar erros no processo",
                "imagemCapa": "/uploads/capas/Trilha Qualidade.png",
                "categoria": "Qualidade",
                "instrutor": "Amazonet Academy",
                "nivel": "Iniciante",
                "cargaHoraria": "10 min",
                "status": "PUBLICADO",
                "modulos": [
                    {
                        "id": "mod-qld-1",
                        "titulo": "Auditoria Comercial",
                        "ordem": 1,
                        "aulas": [
                            {
                                "id": "aula-qld-1",
                                "ordem": 1,
                                "titulo": "Auditoria Comercial",
                                "descricao": "Auditando as vendas",
                                "duracao": "02:38",
                                "youtubeId": "F6NqEFXcbBA",
                                "youtubeUrl": "https://youtu.be/F6NqEFXcbBA",
                                "thumbnail": "/uploads/aulas/qualidade/01.png",
                                "materialPdf": null,
                                "concluida": false
                            }
                        ]
                    },
                    {
                        "id": "mod-qld-2",
                        "titulo": "Aplicando  não conformidade",
                        "ordem": 1,
                        "aulas": [
                            {
                                "id": "aula-qld-2",
                                "ordem": 1,
                                "titulo": "Aplicando Não conformidade",
                                "descricao": "Aplicando não conformidade",
                                "duracao": "02:38",
                                "youtubeId": "wnbnuN9OaME",
                                "youtubeUrl": "https://youtu.be/wnbnuN9OaME",
                                "thumbnail": "/uploads/aulas/qualidade/2.png",
                                "materialPdf": null,
                                "concluida": false
                            }
                        ]
                    },
                    {
                        "id": "mod-qld-3",
                        "titulo": "Reanalise",
                        "ordem": 1,
                        "aulas": [
                            {
                                "id": "aula-qld-3",
                                "ordem": 1,
                                "titulo": "Reanalise de Não conformidades corrigidas",
                                "descricao": "Revendo as correções.",
                                "duracao": "03:16",
                                "youtubeId": "w45FRWTVIPs",
                                "youtubeUrl": "https://youtu.be/w45FRWTVIPs",
                                "thumbnail": "/uploads/aulas/qualidade/2.png",
                                "materialPdf": null,
                                "concluida": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
]