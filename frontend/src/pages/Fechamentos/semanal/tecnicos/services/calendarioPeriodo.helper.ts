import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { dataParaIso, isoParaData } from "@/pages/Fechamentos/semanal/tecnicos/services/periodoFechamento.helper";
import type { PeriodoFechamento } from "@/types/tecnicos";

export type ResultadoSelecaoCalendario =
  | { tipo: "limpar" }
  | { tipo: "inicio"; from: Date }
  | { tipo: "completo"; periodo: PeriodoFechamento };

export const impedirFocoAutomatico = (evento: Event): void => {
  evento.preventDefault();
};

export const ordenarPeriodo = (inicio: Date, fim: Date): DateRange => {
  if (fim.getTime() < inicio.getTime()) {
    return { from: fim, to: inicio };
  }

  return { from: inicio, to: fim };
};

export const montarRangeConfirmado = (
  dataInicio: string,
  dataFim: string,
): DateRange => {
  return {
    from: isoParaData(dataInicio),
    to: isoParaData(dataFim),
  };
};

export const estaEsperandoFim = (rascunho: DateRange | undefined): boolean => {
  return Boolean(rascunho?.from && !rascunho?.to);
};

export const montarRangeExibido = (
  rascunho: DateRange | undefined,
  hover: Date | undefined,
  rangeConfirmado: DateRange,
): DateRange => {
  if (estaEsperandoFim(rascunho) && rascunho?.from && hover) {
    return ordenarPeriodo(rascunho.from, hover);
  }

  return rascunho ?? rangeConfirmado;
};

export const montarRangeBotao = (
  rascunho: DateRange | undefined,
  rangeConfirmado: DateRange,
): DateRange => {
  return rascunho?.from ? rascunho : rangeConfirmado;
};

export const formatarTextoPeriodo = (range: DateRange): string => {
  if (range.from && range.to) {
    return `${format(range.from, "dd/MM/yy", { locale: ptBR })} – ${format(range.to, "dd/MM/yy", { locale: ptBR })}`;
  }

  if (range.from) {
    return `${format(range.from, "dd/MM/yy", { locale: ptBR })} – …`;
  }

  return "Selecione o período";
};

const RASCUNHO_VAZIO: DateRange = { from: undefined, to: undefined };

export const rascunhoAoAbrirCalendario = (
  aberto: boolean,
): DateRange | undefined => {
  return aberto ? RASCUNHO_VAZIO : undefined;
};

export const resolverSelecaoCalendario = (
  periodo: DateRange | undefined,
  rascunho: DateRange | undefined,
): ResultadoSelecaoCalendario => {
  const inicioAnterior = rascunho?.from;

  if (!periodo?.from) {
    return { tipo: "limpar" };
  }

  if (!estaEsperandoFim(rascunho) || !inicioAnterior) {
    return { tipo: "inicio", from: periodo.from };
  }

  const dataFim = periodo.to ?? periodo.from;
  const ordenado = ordenarPeriodo(inicioAnterior, dataFim);

  if (!ordenado.from || !ordenado.to) {
    return { tipo: "inicio", from: periodo.from };
  }

  return {
    tipo: "completo",
    periodo: {
      dataInicio: dataParaIso(ordenado.from),
      dataFim: dataParaIso(ordenado.to),
    },
  };
};