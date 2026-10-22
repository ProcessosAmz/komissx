import { autoTable } from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { formatarData, formatarMoeda } from "../domain/vendasComercial";
import type { ModeloRelatorioComercial } from "../domain/types";

const cabecalho = (documento: jsPDF, modelo: ModeloRelatorioComercial, titulo: string): number => {
  documento.setFont("helvetica", "bold");
  documento.setFontSize(16);
  documento.setTextColor(15, 23, 42);
  documento.text(titulo, 14, 18);
  documento.setFont("helvetica", "normal");
  documento.setFontSize(9);
  documento.text(`Período: ${formatarData(modelo.dataInicio)} a ${formatarData(modelo.dataFim)}`, 14, 26);
  documento.text(`Empresa: ${modelo.empresa || "Todas"} · Unidade: ${modelo.unidade}`, 14, 32);
  documento.text(`Liderança: ${modelo.lideranca} · Supervisão: ${modelo.supervisao}`, 14, 38);
  documento.line(14, 42, documento.internal.pageSize.getWidth() - 14, 42);
  return 48;
};

export function gerarRelatorioPagamentoComercial(modelo: ModeloRelatorioComercial): void {
  if (!modelo.vendas.some((venda) => !venda.desconsiderada)) {
    window.alert("Não há vendas ajustadas para gerar o relatório.");
    return;
  }

  const documento = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let y = cabecalho(documento, modelo, "Relatório de pagamento · Fechamento comercial");
  documento.setFontSize(9);
  documento.text("As regras oficiais de comissão de colaborador, liderança e supervisão ainda não estão definidas; valores aparecem como pendentes.", 14, y);
  y += 6;
  autoTable(documento, {
    startY: y,
    head: [["Colaborador", "Empresa", "Vendas elegíveis", "Base elegível", "Comissão"]],
    body: modelo.linhas.map((linha) => [linha.vendedor, linha.conta, String(linha.quantidadeElegivel), formatarMoeda(linha.valorElegivel), linha.comissao === null ? "Pendente de regra" : formatarMoeda(linha.comissao)]),
    foot: [["Total", "", String(modelo.totalElegivel), formatarMoeda(modelo.valorElegivel), "Pendente de regra"]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  });
  documento.save(`fechamento-comercial-pagamento-${modelo.dataInicio}-${modelo.dataFim}.pdf`);
}

export function gerarRelatorioAnaliticoComercial(modelo: ModeloRelatorioComercial): void {
  const vendasAtivas = modelo.vendas.filter((venda) => !venda.desconsiderada);
  if (!vendasAtivas.length) {
    window.alert("Não há vendas ajustadas para gerar o relatório.");
    return;
  }

  const documento = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const y = cabecalho(documento, modelo, "Relatório analítico de vendas · Fechamento comercial");
  autoTable(documento, {
    startY: y,
    head: [["Vendedor", "Empresa", "Total", "Aprovados", "Aprovado (reanálise)", "Elegíveis", "Valor a receber"]],
    body: modelo.linhas.map((linha) => [linha.vendedor, linha.conta, String(linha.quantidadeTotal), String(linha.aprovados), String(linha.aprovadosReanalise), String(linha.quantidadeElegivel), linha.comissao === null ? "Pendente de regra" : formatarMoeda(linha.comissao)]),
    foot: [["Total", "", String(vendasAtivas.length), String(modelo.linhas.reduce((total, linha) => total + linha.aprovados, 0)), String(modelo.linhas.reduce((total, linha) => total + linha.aprovadosReanalise, 0)), String(modelo.totalElegivel), "Pendente de regra"]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  });
  documento.save(`fechamento-comercial-analitico-${modelo.dataInicio}-${modelo.dataFim}.pdf`);
}
