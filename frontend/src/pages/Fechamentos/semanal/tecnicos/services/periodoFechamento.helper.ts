import { isDataIso } from "@/pages/Fechamentos/semanal/tecnicos/services/queryTecnicos.helper";
import type { PeriodoFechamento } from "@/types/tecnicos";

export interface PeriodoFechamentoSemanal extends PeriodoFechamento {
  dataPagamento: string;
}

export const formatarDataIso = (data: Date): string => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

export const dataParaIso = formatarDataIso;

export const isoParaData = (iso: string): Date | undefined => {
  if (!isDataIso(iso)) {
    return undefined;
  }

  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
};

export const somarDias = (dataIso: string, dias: number): string => {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia + dias);
  return formatarDataIso(data);
};

export const formatarDataBr = (dataIso: string): string => {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
};

const getQuintaMaisRecente = (referencia: Date): Date => {
  const data = new Date(referencia);
  data.setHours(0, 0, 0, 0);
  const diaSemana = data.getDay();
  const diasDesdeQuinta = (diaSemana - 4 + 7) % 7;
  data.setDate(data.getDate() - diasDesdeQuinta);
  return data;
};

export const getPeriodoFechamentoSemanal = (
  referencia: Date = new Date(),
): PeriodoFechamentoSemanal => {
  const quintaPagamento = getQuintaMaisRecente(referencia);
  const dataPagamento = formatarDataIso(quintaPagamento);

  return {
    dataInicio: somarDias(dataPagamento, -7),
    dataFim: somarDias(dataPagamento, -1),
    dataPagamento,
  };
};
