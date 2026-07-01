interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  if (!showText) {
    return null;
  }

  return (
    <div className="flex items-center select-none">
      <span className={`text-lg font-semibold tracking-tight text-white hover:text-slate-200 transition-colors ${className}`}>
        KomissX
      </span>
    </div>
  );
}
