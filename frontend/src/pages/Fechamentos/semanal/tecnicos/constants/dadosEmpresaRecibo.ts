import type { EmpresaFechamento } from "@/pages/Fechamentos/semanal/tecnicos/constants/empresasFechamento";

type CorRgb = [number, number, number];

export type DadosEmpresaRecibo = {
  nome: string;
  razaoSocial: string;
  rua: string;
  cep: string;
  fone: string;
  email: string;
  cidadeUf: string;
  cor: CorRgb;
};

export const DADOS_EMPRESA_RECIBO: Record<
  EmpresaFechamento,
  DadosEmpresaRecibo
> = {
  amazonet: {
    nome: "Amazonet",
    razaoSocial: "AMAZONET TELECOMUNICACOES LTDA",
    rua: "Rua: Rio Jutaí, nº 10, Nossa Senhora das Graças",
    cep: "69053-120",
    fone: "(92) 3182-8100",
    email: "contato@amazonet.com.br",
    cidadeUf: "Manaus-AM",
    cor: [55, 48, 163],
  },
  mania: {
    nome: "Mania",
    razaoSocial: "MANIA TELECOM TELECOMUNICACOES LTDA",
    rua: "Rua: Figueiredo Pimentel, nº 140, Jorge Teixeira",
    cep: "69088-563",
    fone: "(92) 3090-6868",
    email: "contato@maniatelecom.com.br",
    cidadeUf: "Manaus-AM",
    cor: [190, 24, 93],
  },
};

export const VIA_EMPRESA_RECIBO = "1ª VIA EMPRESA";
export const VIA_RECEBEDOR_RECIBO = "2ª VIA RECEBEDOR";
