
type SelectOption = {
    id: string;
    name: string;
};

type Props = {
    label: string;
    value?: string;
    options: SelectOption[];
    disabled?: boolean;
    emptyLabel?: string;
    onChange: (value: string | undefined) => void;
};

const selectClassName =
  "w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 cursor-pointer hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-800";

export function FilterSelect({
    label,
    value,
    options,
    disabled = false,
    emptyLabel = "TODAS",
    onChange,
}: Props) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {label}
            </label>
            <select
                className={selectClassName}
                value={value ?? ""}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value || undefined)}
            >
                <option value="">{emptyLabel}</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
}