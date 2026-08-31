import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { ptBR as ptBRDayPicker } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  dataInicio: string;
  dataFim: string;
  onChange: (periodo: { dataInicio: string; dataFim: string }) => void;
  desabilitado?: boolean;
}

function isoParaData(iso: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return undefined;
  }

  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function dataParaIso(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function ordenarPeriodo(inicio: Date, fim: Date): DateRange {
  if (fim.getTime() < inicio.getTime()) {
    return { from: fim, to: inicio };
  }

  return { from: inicio, to: fim };
}

export function TecnicosDatePicker({
  dataInicio,
  dataFim,
  onChange,
  desabilitado = false,
}: DateRangePickerProps) {
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState<DateRange | undefined>(undefined);
  const [hover, setHover] = useState<Date | undefined>(undefined);
  const rangeConfirmado: DateRange = {
    from: isoParaData(dataInicio),
    to: isoParaData(dataFim),
  };
  const esperandoFim = Boolean(rascunho?.from && !rascunho?.to);
  const rangeSelecionado = rascunho ?? rangeConfirmado;
  const range =
    esperandoFim && rascunho?.from && hover
      ? ordenarPeriodo(rascunho.from, hover)
      : rangeSelecionado;
  const rangeBotao = rascunho?.from ? rascunho : rangeConfirmado;
  const textoPeriodo =
    rangeBotao.from && rangeBotao.to
      ? `${format(rangeBotao.from, "dd/MM/yyyy", { locale: ptBR })} – ${format(rangeBotao.to, "dd/MM/yyyy", { locale: ptBR })}`
      : rangeBotao.from
        ? `${format(rangeBotao.from, "dd/MM/yyyy", { locale: ptBR })} – …`
        : "Selecione o período";

  return (
    <Popover
      open={aberto}
      onOpenChange={(proximo) => {
        setAberto(proximo);
        setHover(undefined);
        setRascunho(proximo ? {} : undefined);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id="periodo"
          disabled={desabilitado}
          className="h-auto w-full justify-between px-3 py-2.5 text-left text-sm font-normal hover:opacity-90"
          style={{
            borderRadius: 12,
            border: "1px solid #1e293b",
            backgroundColor: "rgba(2, 6, 23, 0.7)",
            color: rangeBotao.from ? "#e2e8f0" : "#64748b",
          }}
        >
          {textoPeriodo}
          <ChevronDownIcon style={{ width: 16, height: 16, color: "#64748b", flexShrink: 0 }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="start"
        onOpenAutoFocus={(evento) => evento.preventDefault()}
        onCloseAutoFocus={(evento) => evento.preventDefault()}
        style={{
          border: "1px solid #1e293b",
          backgroundColor: "#0b0f19",
          color: "#f8fafc",
          borderRadius: 12,
        }}
      >
        <Calendar
          mode="range"
          numberOfMonths={2}
          locale={ptBRDayPicker}
          captionLayout="dropdown"
          selected={range}
          defaultMonth={rangeConfirmado.from}
          onDayMouseEnter={(data) => {
            if (esperandoFim) {
              setHover(data);
            }
          }}
          onSelect={(periodo) => {
            const inicioAnterior = rascunho?.from;

            if (!periodo?.from) {
              setRascunho({});
              setHover(undefined);
              return;
            }

            if (!esperandoFim) {
              setRascunho({ from: periodo.from, to: undefined });
              setHover(periodo.from);
              return;
            }

            const dataFim = periodo.to ?? periodo.from;
            const inicio = dataFim < inicioAnterior ? dataFim : inicioAnterior;
            const fim = dataFim < inicioAnterior ? inicioAnterior : dataFim;

            onChange({
              dataInicio: dataParaIso(inicio),
              dataFim: dataParaIso(fim),
            });
            setHover(undefined);
            setRascunho(undefined);
            setAberto(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
