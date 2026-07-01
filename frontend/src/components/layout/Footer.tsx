export function Footer() {
  return (
    <footer className="w-full bg-[#030712] border-t border-slate-900/60 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 mt-auto">
      <div className="text-center sm:text-left space-y-0.5">
        <p>&copy; 2026 <span className="text-slate-400 font-medium">KomissX</span>. </p>
        <p>Desenvolvido por Ketlyn Athan.</p>
        <p className="text-[10px] text-slate-600">Todos os direitos reservados.</p>
      </div>

      <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800/50 px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono">
        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
        Mecanismo de regras v1.0.4
      </div>
    </footer>
  );
}