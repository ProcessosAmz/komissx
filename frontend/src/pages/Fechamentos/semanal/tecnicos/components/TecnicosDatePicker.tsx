import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  valor: string;
  onChange: (value: string) => void;
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

export function TecnicosDatePicker({
  valor,
  onChange,
  desabilitado = false,
}: DatePickerProps) {
  const [aberto, setAberto] = useState(false);
  const dataSelecionada = isoParaData(valor);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={desabilitado}
          className={cn(
            "h-auto w-full justify-start rounded-xl border-slate-800 bg-slate-950/70 px-3 py-2.5 text-left text-sm font-normal text-slate-200 hover:bg-slate-900 hover:text-slate-100",
            !dataSelecionada && "text-slate-500",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
          {dataSelecionada
            ? format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })
            : "Selecione a data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-slate-800 bg-[#0b0f19] p-0 text-slate-100"
        align="start"
      >
        <Calendar
          mode="single"
          selected={dataSelecionada}
          defaultMonth={dataSelecionada}
          onSelect={(data) => {
            if (!data) {
              return;
            }

            onChange(dataParaIso(data));
            setAberto(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
