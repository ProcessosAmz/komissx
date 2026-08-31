import type { OrdemServico } from "@/pages/Fechamentos/types";

function textoBuscaOrdem(os: OrdemServico): string {
  return [
    os.numero_ordem_servico,
    os.codigo_cliente,
    os.nome_cliente,
    os.usuario_fechamento_limpo,
    os.usuario_fechamento,
    os.conta,
    os.cidade,
    os.estado,
    os.tipo_ordem_servico,
  ]
    .join(" ")
    .toLowerCase();
}

export function ordemCorrespondeABusca(os: OrdemServico, busca: string): boolean {
  const termos = busca
    .trim()
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter((termo) => termo.length > 0 && termo !== "e");

  if (termos.length === 0) {
    return true;
  }

  const texto = textoBuscaOrdem(os);
  return termos.every((termo) => texto.includes(termo));
}
