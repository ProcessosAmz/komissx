import { useState } from "react";
import type { DateRange } from "react-day-picker";
import type { PeriodoFechamento } from "@/types/tecnicos";
import {
  estaEsperandoFim,
  formatarTextoPeriodo,
  montarRangeBotao,
  montarRangeConfirmado,
  montarRangeExibido,
  rascunhoAoAbrirCalendario,
  resolverSelecaoCalendario,
} from "@/pages/Fechamentos/semanal/tecnicos/services/calendarioPeriodo.helper";

interface UseCalendarioPeriodoParams {
  dataInicio: string;
  dataFim: string;
  onChange: (periodo: PeriodoFechamento) => void;
}

export function useCalendarioPeriodo({
  dataInicio,
  dataFim,
  onChange,
}: UseCalendarioPeriodoParams) {
  const [aberto, setAberto] = useState<boolean>(false);
  const [rascunho, setRascunho] = useState<DateRange | undefined>(undefined);
  const [hover, setHover] = useState<Date | undefined>(undefined);

  const rangeConfirmado = montarRangeConfirmado(dataInicio, dataFim);
  const range = montarRangeExibido(rascunho, hover, rangeConfirmado);
  const rangeBotao = montarRangeBotao(rascunho, rangeConfirmado);
  const textoPeriodo = formatarTextoPeriodo(rangeBotao);

  const aoMudarAberto = (proximo: boolean): void => {
    setAberto(proximo);
    setHover(undefined);
    setRascunho(rascunhoAoAbrirCalendario(proximo));
  };

  const aoHoverDia = (data: Date): void => {
    if (estaEsperandoFim(rascunho)) {
      setHover(data);
    }
  };

  const aoSelecionarPeriodo = (periodo: DateRange | undefined): void => {
    const resultado = resolverSelecaoCalendario(periodo, rascunho);

    if (resultado.tipo === "limpar") {
      setRascunho({ from: undefined, to: undefined });
      setHover(undefined);
      return;
    }

    if (resultado.tipo === "inicio") {
      setRascunho({ from: resultado.from, to: undefined });
      setHover(resultado.from);
      return;
    }

    onChange(resultado.periodo);
    setHover(undefined);
    setRascunho(undefined);
    setAberto(false);
  };

  return {
    aberto,
    range,
    rangeBotao,
    rangeConfirmado,
    textoPeriodo,
    aoMudarAberto,
    aoHoverDia,
    aoSelecionarPeriodo,
  };
}