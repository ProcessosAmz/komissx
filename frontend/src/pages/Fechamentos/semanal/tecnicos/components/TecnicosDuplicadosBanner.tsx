import { AlertTriangle } from "lucide-react";

interface BannerProps {
  quantidadeOs: number;
  quantidadeClientes: number;
  visivel: boolean;
  onFiltrarDuplicados: () => void;
}

export function TecnicosDuplicadosBanner({
  quantidadeOs,
  quantidadeClientes,
  visivel,
  onFiltrarDuplicados,
}: BannerProps) {
  if (!visivel) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onFiltrarDuplicados}
      className="flex w-full items-start gap-3 rounded-2xl border border-amber-400 bg-amber-400 px-4 py-3 text-left text-amber-950 shadow-[0_0_0_1px_rgba(251,191,36,0.6)]"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <span>
        <span className="block text-sm font-bold uppercase tracking-wide">
          {quantidadeOs} OS duplicadas em {quantidadeClientes} clientes
        </span>
        <span className="mt-0.5 block text-sm font-medium">
          Revise e exclua as OS repetidas antes de fechar. Clique para ver só
          os duplicados.
        </span>
      </span>
    </button>
  );
}
