export const EMPRESAS_FECHAMENTO = ["amazonet", "mania"] as const;

export type EmpresaFechamento = (typeof EMPRESAS_FECHAMENTO)[number];
