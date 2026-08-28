const UNIDADES = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
];

const DEZ_A_DEZENOVE = [
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];

const DEZENAS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];

const CENTENAS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function juntarPartes(partes: string[]): string {
  return partes.filter(Boolean).join(" e ");
}

function numeroAteCem(valor: number): string {
  if (valor < 10) {
    return UNIDADES[valor];
  }

  if (valor < 20) {
    return DEZ_A_DEZENOVE[valor - 10];
  }

  const dezena = Math.floor(valor / 10);
  const unidade = valor % 10;
  return unidade === 0 ? DEZENAS[dezena] : `${DEZENAS[dezena]} e ${UNIDADES[unidade]}`;
}

function numeroAteMil(valor: number): string {
  if (valor < 100) {
    return numeroAteCem(valor);
  }

  if (valor === 100) {
    return "cem";
  }

  const centena = Math.floor(valor / 100);
  const resto = valor % 100;
  return resto === 0 ? CENTENAS[centena] : `${CENTENAS[centena]} e ${numeroAteCem(resto)}`;
}

function numeroPorExtenso(valor: number): string {
  if (valor === 0) {
    return "zero";
  }

  if (valor < 1000) {
    return numeroAteMil(valor);
  }

  const milhar = Math.floor(valor / 1000);
  const resto = valor % 1000;
  const prefixo = milhar === 1 ? "mil" : `${numeroAteMil(milhar)} mil`;

  if (resto === 0) {
    return prefixo;
  }

  return `${prefixo} e ${numeroAteMil(resto)}`;
}

export function valorPorExtenso(valor: number): string {
  const arredondado = Math.round(Math.abs(valor) * 100) / 100;
  const reais = Math.floor(arredondado);
  const centavos = Math.round((arredondado - reais) * 100);
  const parteReais =
    reais === 0
      ? "zero reais"
      : `${numeroPorExtenso(reais)} ${reais === 1 ? "real" : "reais"}`;

  if (centavos === 0) {
    return parteReais;
  }

  const parteCentavos = `${numeroPorExtenso(centavos)} ${
    centavos === 1 ? "centavo" : "centavos"
  }`;

  if (reais === 0) {
    return parteCentavos;
  }

  return juntarPartes([parteReais, parteCentavos]);
}
