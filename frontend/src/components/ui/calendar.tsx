import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("group/calendar p-2", className)}
      style={{
        backgroundColor: "#0b0f19",
        color: "#e2e8f0",
        ["--cell-size" as string]: "28px",
      }}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("pt-BR", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-2 md:flex-row md:gap-3",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-2", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "flex h-7 w-7 select-none items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc]",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "flex h-7 w-7 select-none items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc]",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-7 w-full items-center justify-center px-7 text-[12px] font-semibold text-[#f8fafc]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-7 w-full items-center justify-center gap-1 text-[12px] font-semibold text-[#f8fafc]",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-md border border-[#334155] bg-[#020617]",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-[#020617] text-[#e2e8f0] opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none text-[12px] font-semibold text-[#f8fafc]",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 select-none rounded-md text-[10px] font-medium uppercase text-[#64748b]",
          defaultClassNames.weekday
        ),
        week: cn("mt-0.5 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative h-7 w-7 select-none p-0 text-center",
          defaultClassNames.day
        ),
        range_start: cn("rounded-l-md bg-[#4f46e5]", defaultClassNames.range_start),
        range_middle: cn("rounded-none bg-[#312e81]", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-[#4f46e5]", defaultClassNames.range_end),
        today: cn("rounded-md", defaultClassNames.today),
        outside: cn("opacity-40", defaultClassNames.outside),
        disabled: cn("opacity-30", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...rootProps }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              style={{ backgroundColor: "#0b0f19", color: "#e2e8f0" }}
              {...rootProps}
            />
          )
        },
        Chevron: ({ className, orientation, ...chevronProps }) => {
          const chevronStyle = { color: "#94a3b8", width: 14, height: 14 }
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn(className)} style={chevronStyle} {...chevronProps} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn(className)} style={chevronStyle} {...chevronProps} />
            )
          }

          return (
            <ChevronDownIcon className={cn(className)} style={chevronStyle} {...chevronProps} />
          )
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus()
    }
  }, [modifiers.focused])

  const inicio = Boolean(modifiers.range_start)
  const fim = Boolean(modifiers.range_end)
  const meio = Boolean(modifiers.range_middle)
  const unico = Boolean(modifiers.selected && !inicio && !fim && !meio)
  const hoje = Boolean(modifiers.today)

  let backgroundColor = "transparent"
  let color = "#e2e8f0"
  let borderRadius = "6px"
  let border = "1px solid transparent"

  if (meio) {
    backgroundColor = "#312e81"
    color = "#c7d2fe"
    borderRadius = "0"
  }

  if (inicio || fim || unico) {
    backgroundColor = "#4f46e5"
    color = "#ffffff"
  }

  if (inicio && !fim) {
    borderRadius = "6px 0 0 6px"
  }

  if (fim && !inicio) {
    borderRadius = "0 6px 6px 0"
  }

  if (inicio && fim) {
    borderRadius = "6px"
  }

  if (hoje && !inicio && !fim && !meio && !unico) {
    border = "1px solid #6366f1"
    color = "#a5b4fc"
  }

  if (modifiers.outside) {
    color = "#475569"
  }

  const [emHover, setEmHover] = React.useState(false)
  const selecionado = inicio || fim || meio || unico

  if (emHover && !selecionado) {
    backgroundColor = "#4f46e5"
    color = "#ffffff"
    border = "1px solid #818cf8"
  }

  const { style: estiloRecebido, onMouseEnter, onMouseLeave, ...resto } = props

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "h-7 w-7 min-w-7 p-0 text-[12px] font-medium leading-none",
        defaultClassNames.day_button,
        className
      )}
      style={{
        ...estiloRecebido,
        backgroundColor,
        color,
        borderRadius,
        border,
        width: 28,
        height: 28,
        minWidth: 28,
        cursor: "pointer",
      }}
      onMouseEnter={(evento) => {
        setEmHover(true)
        onMouseEnter?.(evento)
      }}
      onMouseLeave={(evento) => {
        setEmHover(false)
        onMouseLeave?.(evento)
      }}
      {...resto}
    />
  )
}

export { Calendar, CalendarDayButton }
