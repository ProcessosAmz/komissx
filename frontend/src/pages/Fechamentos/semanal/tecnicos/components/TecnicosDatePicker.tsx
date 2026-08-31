import { ChevronDownIcon } from "lucide-react";
import { ptBR as ptBRDayPicker } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PeriodoFechamento } from "@/types/tecnicos";
import { useCalendarioPeriodo } from "@/pages/Fechamentos/semanal/tecnicos/hooks/useCalendarioPeriodo";
import { impedirFocoAutomatico } from "@/pages/Fechamentos/semanal/tecnicos/services/calendarioPeriodo.helper";

interface DateRangePickerProps {
  dataInicio: string;
  dataFim: string;
  onChange: (periodo: PeriodoFechamento) => void;
  desabilitado?: boolean;
}

export function TecnicosDatePicker({
  dataInicio,
  dataFim,
  onChange,
  desabilitado = false,
}: DateRangePickerProps) {
  const {
    aberto,
    range,
    rangeBotao,
    rangeConfirmado,
    textoPeriodo,
    aoMudarAberto,
    aoHoverDia,
    aoSelecionarPeriodo,
  } = useCalendarioPeriodo({ dataInicio, dataFim, onChange });

  return (
    <Popover open={aberto} onOpenChange={aoMudarAberto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id="periodo"
          disabled={desabilitado}
          className="h-[42px] w-full justify-between gap-2 px-3 py-0 text-left text-sm font-normal tabular-nums hover:opacity-90"
          style={{
            borderRadius: 12,
            border: "1px solid #1e293b",
            backgroundColor: "rgba(2, 6, 23, 0.7)",
            color: rangeBotao.from ? "#e2e8f0" : "#64748b",
          }}
        >
          <span className="min-w-0 truncate">{textoPeriodo}</span>
          <ChevronDownIcon
            style={{ width: 14, height: 14, color: "#64748b", flexShrink: 0 }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="start"
        onOpenAutoFocus={impedirFocoAutomatico}
        onCloseAutoFocus={impedirFocoAutomatico}
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
          onDayMouseEnter={aoHoverDia}
          onSelect={aoSelecionarPeriodo}
        />
      </PopoverContent>
    </Popover>
  );
}
