import { jsPDF } from "jspdf";
import type { TecnicoRowViewModel } from "@/pages/Fechamentos/types";
import {
  DADOS_EMPRESA_RECIBO,
  VIA_EMPRESA_RECIBO,
  VIA_RECEBEDOR_RECIBO,
} from "@/pages/Fechamentos/semanal/tecnicos/constants";
import {
  formatarDataBr,
  formatarDataIso,
  somarDias,
} from "@/pages/Fechamentos/semanal/tecnicos/services/periodoFechamento.helper";
import { isDataIso } from "@/pages/Fechamentos/semanal/tecnicos/services/queryTecnicos.helper";
import { valorPorExtenso } from "@/pages/Fechamentos/semanal/tecnicos/services/valorPorExtenso";
import {
  formatarMoeda,
  montarRecibosPorEmpresa,
  nomeEmpresa,
  desenharTabelaOrdens,
  type ContaEmpresa,
  type ReciboPorTecnicoEmpresa,
} from "@/pages/Fechamentos/semanal/tecnicos/services/documentosTecnicos";

const MARGEM = 12;
const ALTURA_VIA = 132;
const Y_SEGUNDA_VIA = 154;

const capitalizarFrase = (texto: string): string => {
  if (texto.length === 0) {
    return texto;
  }

  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const capitalizarNome = (nome: string): string => {
  return nome
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
};

const slugificar = (texto: string): string => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const nomesEmpresasNoArquivo = (contas: ContaEmpresa[]): string => {
  return contas.map((conta) => slugificar(nomeEmpresa(conta))).join("-");
};

export const dataReciboDasOrdens = (ordens: TecnicoRowViewModel[]): string => {
  const datas = ordens
    .map((ordem) => ordem.data_termino_executado.slice(0, 10))
    .filter(isDataIso)
    .sort();

  if (datas.length === 0) {
    return formatarDataBr(formatarDataIso(new Date()));
  }

  return formatarDataBr(somarDias(datas[datas.length - 1], 1));
};

export const textoReferenteInstalacoes = (quantidade: number): string => {
  const rotulo = quantidade === 1 ? "INSTALAÇÃO" : "INSTALAÇÕES";
  return `${quantidade} ${rotulo}`;
};

const desenharLinhaCampo = (
  documento: jsPDF,
  label: string,
  valor: string,
  x: number,
  y: number,
  largura: number,
): void => {
  documento.setFont("helvetica", "bold");
  documento.setFontSize(9);
  documento.setTextColor(15, 23, 42);
  documento.text(`${label}: `, x, y);

  const inicioValor = x + documento.getTextWidth(`${label}: `);
  documento.setFont("helvetica", "normal");
  const linhas = documento.splitTextToSize(valor, largura - (inicioValor - x));
  documento.text(linhas, inicioValor, y);
};

const desenharViaRecibo = (
  documento: jsPDF,
  recibo: ReciboPorTecnicoEmpresa,
  origemY: number,
  codigoPagamento: number,
  dataBr: string,
  via: string,
): void => {
  const empresa = DADOS_EMPRESA_RECIBO[recibo.conta];
  const larguraPagina = documento.internal.pageSize.getWidth();
  const larguraUtil = larguraPagina - MARGEM * 2;
  const centroX = larguraPagina / 2;
  const xTexto = MARGEM + 10;
  const larguraTexto = larguraUtil - 20;

  documento.setDrawColor(30, 30, 30);
  documento.setLineWidth(0.3);
  documento.rect(MARGEM, origemY, larguraUtil, ALTURA_VIA);

  let cursorY = origemY + 10;
  documento.setFont("helvetica", "bold");
  documento.setFontSize(11);
  documento.setTextColor(0, 0, 0);
  documento.text(empresa.razaoSocial, centroX, cursorY, { align: "center" });

  documento.setFont("helvetica", "normal");
  documento.setFontSize(8);
  cursorY += 5;
  documento.text(`${empresa.rua} CEP: ${empresa.cep}`, centroX, cursorY, {
    align: "center",
  });
  cursorY += 4.2;
  documento.text(`Fone: ${empresa.fone}`, centroX, cursorY, { align: "center" });
  cursorY += 4.2;
  documento.text(`E-mail: ${empresa.email}`, centroX, cursorY, {
    align: "center",
  });
  cursorY += 4.2;
  documento.text(empresa.cidadeUf, centroX, cursorY, { align: "center" });

  cursorY += 9;
  documento.setFont("helvetica", "bold");
  documento.setFontSize(16);
  documento.text("RECIBO", centroX, cursorY, { align: "center" });

  cursorY += 8;
  documento.setFontSize(14);
  documento.text(formatarMoeda(recibo.total), centroX, cursorY, {
    align: "center",
  });

  cursorY += 8;
  documento.setFontSize(8);
  documento.text(
    `CÓDIGO PAGAMENTO: ${codigoPagamento}     DATA: ${dataBr}     ${via}`,
    centroX,
    cursorY,
    { align: "center" },
  );

  cursorY += 10;
  desenharLinhaCampo(
    documento,
    "RECEBI DA EMPRESA",
    empresa.razaoSocial,
    xTexto,
    cursorY,
    larguraTexto,
  );
  cursorY += 7;
  desenharLinhaCampo(
    documento,
    "A QUANTIA DE",
    capitalizarFrase(valorPorExtenso(recibo.total)),
    xTexto,
    cursorY,
    larguraTexto,
  );
  cursorY += 7;
  desenharLinhaCampo(
    documento,
    "REFERENTE A",
    textoReferenteInstalacoes(recibo.quantidade),
    xTexto,
    cursorY,
    larguraTexto,
  );
  cursorY += 7;
  desenharLinhaCampo(
    documento,
    "RECEBEDOR",
    capitalizarNome(recibo.tecnico),
    xTexto,
    cursorY,
    larguraTexto,
  );

  const yAssinatura = origemY + ALTURA_VIA - 18;
  documento.setFont("helvetica", "bold");
  documento.setFontSize(9);
  documento.text("ASSINATURA DO RECEBEDOR:", xTexto, yAssinatura);
  documento.setLineWidth(0.3);
  documento.line(xTexto, yAssinatura + 12, xTexto + 90, yAssinatura + 12);
};

const desenharLinhaCorte = (documento: jsPDF): void => {
  const larguraPagina = documento.internal.pageSize.getWidth();
  const yCorte = (MARGEM + ALTURA_VIA + Y_SEGUNDA_VIA) / 2;

  documento.setDrawColor(120, 120, 120);
  documento.setLineWidth(0.2);
  documento.setLineDashPattern([1, 1.4], 0);
  documento.line(MARGEM, yCorte, larguraPagina - MARGEM, yCorte);
  documento.setLineDashPattern([], 0);
};

export const gerarReciboTecnicos = (dados: TecnicoRowViewModel[]): void => {
  const recibos = montarRecibosPorEmpresa(dados);

  if (recibos.length === 0) {
    window.alert("Não há instalações pagas para gerar o recibo.");
    return;
  }

  const documento = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const contas = Array.from(new Set(recibos.map((recibo) => recibo.conta)));

  recibos.forEach((recibo, indice) => {
    if (indice > 0) {
      documento.addPage();
    }

    const codigoPagamento = indice + 1;
    const dataBr = dataReciboDasOrdens(recibo.ordens);

    desenharViaRecibo(
      documento,
      recibo,
      MARGEM,
      codigoPagamento,
      dataBr,
      VIA_EMPRESA_RECIBO,
    );
    desenharLinhaCorte(documento);
    desenharViaRecibo(
      documento,
      recibo,
      Y_SEGUNDA_VIA,
      codigoPagamento,
      dataBr,
      VIA_RECEBEDOR_RECIBO,
    );

    documento.addPage();
    const larguraPagina = documento.internal.pageSize.getWidth();
    documento.setFont("helvetica", "bold");
    documento.setFontSize(12);
    documento.setTextColor(15, 23, 42);
    documento.text("Ordens de serviço", 14, 18);
    documento.setFont("helvetica", "normal");
    documento.setFontSize(10);
    documento.setTextColor(71, 85, 105);
    documento.text(
      `${recibo.tecnico}  ·  ${recibo.quantidade} OS  ·  ${formatarMoeda(recibo.total)}`,
      14,
      26,
    );
    documento.text(nomeEmpresa(recibo.conta), larguraPagina - 14, 18, {
      align: "right",
    });
    desenharTabelaOrdens(documento, recibo.ordens, recibo.conta, 32);
  });

  documento.save(`recibo-instalacao-${nomesEmpresasNoArquivo(contas)}.pdf`);
};
