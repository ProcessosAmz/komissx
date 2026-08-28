import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { TecnicoRowViewModel } from "../../../types";
import { valorPorExtenso } from "./valorPorExtenso";

export type ContaEmpresa = "amazonet" | "mania";

export const EMPRESAS_DOCUMENTO: Record<
  ContaEmpresa,
  { nome: string; cor: [number, number, number] }
> = {
  amazonet: { nome: "Amazonet", cor: [55, 48, 163] },
  mania: { nome: "Mania", cor: [190, 24, 93] },
};

export type ReciboPorTecnicoEmpresa = {
  conta: ContaEmpresa;
  nomeEmpresa: string;
  tecnico: string;
  ordens: TecnicoRowViewModel[];
  quantidade: number;
  total: number;
};

export function nomeEmpresa(conta: ContaEmpresa): string {
  return EMPRESAS_DOCUMENTO[conta].nome;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function agruparPorEmpresa(
  dados: TecnicoRowViewModel[],
): Record<ContaEmpresa, TecnicoRowViewModel[]> {
  return {
    amazonet: dados.filter((ordem) => ordem.conta === "amazonet"),
    mania: dados.filter((ordem) => ordem.conta === "mania"),
  };
}

export function montarRecibosPorEmpresa(
  dados: TecnicoRowViewModel[],
): ReciboPorTecnicoEmpresa[] {
  const pagos = dados.filter(
    (ordem) => ordem.status_financeiro === "PAGO" && ordem.valor_a_pagar > 0,
  );
  const agrupados = new Map<string, ReciboPorTecnicoEmpresa>();

  pagos.forEach((ordem) => {
    const chave = `${ordem.conta}::${ordem.tecnico_id ?? ordem.usuario_fechamento_limpo}`;
    const existente = agrupados.get(chave);

    if (existente) {
      existente.ordens.push(ordem);
      existente.quantidade += 1;
      existente.total += ordem.valor_a_pagar;
      return;
    }

    agrupados.set(chave, {
      conta: ordem.conta,
      nomeEmpresa: nomeEmpresa(ordem.conta),
      tecnico: ordem.usuario_fechamento_limpo,
      ordens: [ordem],
      quantidade: 1,
      total: ordem.valor_a_pagar,
    });
  });

  return Array.from(agrupados.values()).sort((primeiro, segundo) => {
    if (primeiro.conta !== segundo.conta) {
      return primeiro.conta === "amazonet" ? -1 : 1;
    }

    return primeiro.tecnico.localeCompare(segundo.tecnico, "pt-BR");
  });
}

function statusRelatorio(ordem: TecnicoRowViewModel): string {
  return ordem.status_financeiro === "PAGO" ? "APROVADO" : "REPROVADO";
}

function totalOrdens(ordens: TecnicoRowViewModel[]): number {
  return ordens.reduce((acumulado, ordem) => acumulado + ordem.valor_a_pagar, 0);
}

function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nomesEmpresasNoArquivo(contas: ContaEmpresa[]): string {
  return contas.map((conta) => slugificar(nomeEmpresa(conta))).join("-");
}

function yFinalTabela(documento: jsPDF): number {
  const tabela = (documento as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable;
  return tabela?.finalY ?? 80;
}

function criarPdf(): jsPDF {
  return new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
}

function desenharCabecalho(
  documento: jsPDF,
  conta: ContaEmpresa,
  tipoDocumento: string,
): void {
  const empresa = EMPRESAS_DOCUMENTO[conta];
  const larguraPagina = documento.internal.pageSize.getWidth();

  documento.setFont("helvetica", "bold");
  documento.setFontSize(22);
  documento.setTextColor(...empresa.cor);
  documento.text(empresa.nome.toUpperCase(), 14, 18);

  documento.setFontSize(12);
  documento.setTextColor(15, 23, 42);
  documento.text(tipoDocumento, larguraPagina - 14, 18, { align: "right" });

  documento.setDrawColor(...empresa.cor);
  documento.setLineWidth(1.2);
  documento.line(14, 22, larguraPagina - 14, 22);

  documento.setFont("helvetica", "normal");
  documento.setFontSize(10);
  documento.setTextColor(71, 85, 105);
  documento.text("Fechamento semanal de instalação", 14, 28);
}

function desenharMetadados(
  documento: jsPDF,
  linhas: string[],
  inicioY: number,
): number {
  documento.setFont("helvetica", "normal");
  documento.setFontSize(10);
  documento.setTextColor(15, 23, 42);

  linhas.forEach((linha, indice) => {
    documento.text(linha, 14, inicioY + indice * 6);
  });

  return inicioY + linhas.length * 6;
}

function linhasTabela(ordens: TecnicoRowViewModel[]): string[][] {
  return ordens.map((ordem) => [
    ordem.codigo_cliente,
    ordem.numero_ordem_servico,
    ordem.usuario_fechamento_limpo,
    ordem.tipo_ordem_servico,
    `${ordem.cidade}/${ordem.estado}`,
    statusRelatorio(ordem),
    ordem.status_financeiro,
    formatarMoeda(ordem.valor_a_pagar),
  ]);
}

function desenharTabelaOrdens(
  documento: jsPDF,
  ordens: TecnicoRowViewModel[],
  conta: ContaEmpresa,
  inicioY: number,
): number {
  autoTable(documento, {
    startY: inicioY,
    head: [
      [
        "Cliente",
        "O.S",
        "Técnico",
        "Tipo",
        "Cidade",
        "Status",
        "Financeiro",
        "Valor",
      ],
    ],
    body: linhasTabela(ordens),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: EMPRESAS_DOCUMENTO[conta].cor,
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      7: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  return yFinalTabela(documento);
}

export function gerarRelatorioTecnicos(
  dados: TecnicoRowViewModel[],
): void {
  if (dados.length === 0) {
    window.alert("Não há instalações para gerar o relatório.");
    return;
  }

  const porEmpresa = agruparPorEmpresa(dados);
  const contasComDados = (Object.keys(porEmpresa) as ContaEmpresa[]).filter(
    (conta) => porEmpresa[conta].length > 0,
  );
  const documento = criarPdf();

  contasComDados.forEach((conta, indice) => {
    if (indice > 0) {
      documento.addPage();
    }

    const ordens = porEmpresa[conta];
    desenharCabecalho(documento, conta, "Relatório");
    const depoisMetadados = desenharMetadados(
      documento,
      [`Empresa: ${nomeEmpresa(conta)}`],
      36,
    );
    const depoisTabela = desenharTabelaOrdens(
      documento,
      ordens,
      conta,
      depoisMetadados + 4,
    );
    documento.setFont("helvetica", "bold");
    documento.setFontSize(11);
    documento.setTextColor(15, 23, 42);
    documento.text(
      `Subtotal ${nomeEmpresa(conta)}: ${formatarMoeda(totalOrdens(ordens))}`,
      documento.internal.pageSize.getWidth() - 14,
      depoisTabela + 10,
      { align: "right" },
    );
  });

  documento.save(
    `relatorio-instalacao-${nomesEmpresasNoArquivo(contasComDados)}.pdf`,
  );
}

export function gerarReciboTecnicos(
  dados: TecnicoRowViewModel[],
): void {
  const recibos = montarRecibosPorEmpresa(dados);

  if (recibos.length === 0) {
    window.alert("Não há instalações pagas para gerar o recibo.");
    return;
  }

  const documento = criarPdf();
  const contas = Array.from(new Set(recibos.map((recibo) => recibo.conta)));

  recibos.forEach((recibo, indice) => {
    if (indice > 0) {
      documento.addPage();
    }

    const larguraPagina = documento.internal.pageSize.getWidth();
    desenharCabecalho(documento, recibo.conta, "Recibo");
    const depoisMetadados = desenharMetadados(
      documento,
      [
        `Empresa: ${recibo.nomeEmpresa}`,
        `Técnico: ${recibo.tecnico}`,
      ],
      36,
    );

    const textoRecibo = `Recebi da empresa ${recibo.nomeEmpresa} a importância de ${formatarMoeda(recibo.total)} (${valorPorExtenso(recibo.total)}), referente a ${recibo.quantidade} instalação(ões) aprovada(s).`;
    const linhasTexto = documento.splitTextToSize(textoRecibo, larguraPagina - 28);
    documento.setFont("helvetica", "normal");
    documento.setFontSize(11);
    documento.setTextColor(15, 23, 42);
    documento.text(linhasTexto, 14, depoisMetadados + 10);

    const inicioTabela = depoisMetadados + 10 + linhasTexto.length * 6 + 4;
    const depoisTabela = desenharTabelaOrdens(
      documento,
      recibo.ordens,
      recibo.conta,
      inicioTabela,
    );

    documento.setFont("helvetica", "bold");
    documento.setFontSize(11);
    documento.text(
      `Total do recibo: ${formatarMoeda(recibo.total)}`,
      larguraPagina - 14,
      depoisTabela + 10,
      { align: "right" },
    );

    const yAssinatura = Math.min(depoisTabela + 40, 250);
    documento.setDrawColor(15, 23, 42);
    documento.setLineWidth(0.4);
    documento.line(20, yAssinatura, 90, yAssinatura);
    documento.line(120, yAssinatura, 190, yAssinatura);
    documento.setFont("helvetica", "normal");
    documento.setFontSize(9);
    documento.text(recibo.tecnico, 55, yAssinatura + 6, { align: "center" });
    documento.text("Técnico", 55, yAssinatura + 11, { align: "center" });
    documento.text(recibo.nomeEmpresa, 155, yAssinatura + 6, { align: "center" });
    documento.text("Empresa", 155, yAssinatura + 11, { align: "center" });
  });

  documento.save(`recibo-instalacao-${nomesEmpresasNoArquivo(contas)}.pdf`);
}
