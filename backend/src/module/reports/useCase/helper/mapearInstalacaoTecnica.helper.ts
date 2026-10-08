import { Host } from "@/common/enums/host.enum";
import {
  CAMPOS_BAIRRO,
  CAMPOS_CIDADE,
  CAMPOS_CODIGO_CLIENTE,
  CAMPOS_DATA_TERMINO,
  CAMPOS_ESTADO,
  CAMPOS_ETAPA_INSTALACAO,
  CAMPOS_MOTIVO_FECHAMENTO,
  CAMPOS_MOTIVO_INSTALACAO,
  CAMPOS_NOME_CLIENTE,
  CAMPOS_NUMERO_OS,
  CAMPOS_STATUS_INSTALACAO,
  CAMPOS_TIPO_OS,
  CAMPOS_USUARIO_ABERTURA,
  CAMPOS_USUARIO_FECHAMENTO,
} from "@/module/reports/constants/camposMetabaseInstalacao.constants";
import {
  OrdemServicoInstalacaoResponseDto,
  TecnicoFechamentoResponseDto,
} from "@/module/reports/dto/ordemServicoInstalacao.response.dto";
import type { StatusAuditoriaResposta } from "@/module/reports/types/statusAuditoriaInstalacao.type";

const toRecord = (row: unknown): Record<string, unknown> => {
  if (row && typeof row === "object" && !Array.isArray(row)) {
    return row as Record<string, unknown>;
  }

  return {};
};

const lerCampo = (
  row: Record<string, unknown>,
  aliases: readonly string[],
): string => {
  const entries = Object.entries(row);

  for (const alias of aliases) {
    const match = entries.find(([key]) => key.toLowerCase().trim() === alias);

    if (!match) {
      continue;
    }

    const value = match[1];

    if (value === null || value === undefined) {
      continue;
    }

    return String(value).trim();
  }

  return "";
};

export const normalizarTexto = (valor: string): string =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

export const limparNomeTecnico = (usuarioFechamento: string): string => {
  const nome = usuarioFechamento.trim();
  const indiceSufixo = nome.search(/_|\s+TEC[_ ]/i);

  if (indiceSufixo <= 0) {
    return nome;
  }

  return nome.slice(0, indiceSufixo).trim();
};

export const isOsInstalacao = (tipoOrdemServico: string): boolean => {
  const tipo = normalizarTexto(tipoOrdemServico);

  if (tipo.includes("MUDANCA DE ENDERECO")) {
    return true;
  }

  if (tipo.includes("NAO CONFORMIDADE")) {
    return true;
  }

  if (!tipo.includes("INSTALACAO")) {
    return false;
  }

  return !tipo.includes("POS ");
};

export const toDataFimExclusivaMetabase = (dataFimInclusiva: string): string => {
  const [ano, mes, dia] = dataFimInclusiva.slice(0, 10).split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia + 1));
  return data.toISOString().slice(0, 10);
};

export const toDataFimMetabase = (
  dataFimInclusiva: string,
  host: Host,
): string => {
  if (host === Host.MANIA) {
    return dataFimInclusiva.slice(0, 10);
  }

  return toDataFimExclusivaMetabase(dataFimInclusiva);
};

export const classificarStatusAuditoria = (
  motivoInstalacao: string,
  conta?: Host,
): StatusAuditoriaResposta => {
  const motivo = normalizarTexto(motivoInstalacao);

  if (!motivo) {
    return "";
  }

  if (motivo.includes("NC APROVADO") || motivo.includes("N.C APROVADO")) {
    return conta === Host.MANIA ? "APROVADO" : "REPROVADO";
  }

  if (
    motivo.includes("REPROVAD") ||
    motivo.includes("NAO APROV") ||
    motivo.includes("NAO CONFORMIDADE")
  ) {
    return "REPROVADO";
  }

  if (motivo.includes("APROVAD")) {
    return "APROVADO";
  }

  if (
    motivo.includes("AGUARDANDO") ||
    motivo.includes("PENDENTE") ||
    motivo.includes("EM AUDITORIA")
  ) {
    return "PENDENTE";
  }

  return "";
};

export const formatarDataTermino = (valor: string): string => {
  if (!valor) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
    return valor.slice(0, 10);
  }

  return valor;
};

export const empresaParaConta = (nomeEmpresa: string): Host => {
  if (normalizarTexto(nomeEmpresa).includes("MANIA")) {
    return Host.MANIA;
  }

  return Host.AMAZONET;
};

export const inferirConta = (
  numeroOrdemServico: string,
  urlMetabase: string,
  usuarioFechamento: string,
  contaOrigem?: Host,
): Host => {
  const prefixo = numeroOrdemServico.replace(/\D/g, "").slice(0, 4);

  if (prefixo === "0048") {
    return Host.MANIA;
  }

  if (prefixo === "0032") {
    return Host.AMAZONET;
  }

  if (contaOrigem) {
    return contaOrigem;
  }

  const origem = `${urlMetabase} ${usuarioFechamento}`.toLowerCase();

  if (origem.includes("mania")) {
    return Host.MANIA;
  }

  return Host.AMAZONET;
};

export const toMetabaseJsonUrl = (url: string): string => {
  const match = url.match(/\/public\/question\/([0-9a-f-]{36})/i);

  if (!match) {
    return url;
  }

  const origin = new URL(url).origin;
  return `${origin}/api/public/card/${match[1]}/query/json`;
};

export const extrairLinhasMetabase = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const corpo = payload as Record<string, unknown>;

  if (Array.isArray(corpo.data)) {
    return corpo.data;
  }

  const nested = corpo.data;
  if (nested && typeof nested === "object") {
    const rows = (nested as Record<string, unknown>).rows;
    if (Array.isArray(rows)) {
      return rows;
    }
  }

  return [];
};

export const mapearLinhaInstalacaoTecnica = (
  row: unknown,
  index: number,
  urlMetabase: string,
  contaOrigem?: Host,
): OrdemServicoInstalacaoResponseDto | null => {
  const registro = toRecord(row);
  const tipoOrdemServico = lerCampo(registro, CAMPOS_TIPO_OS);

  if (!isOsInstalacao(tipoOrdemServico)) {
    return null;
  }

  const usuarioFechamento = lerCampo(registro, CAMPOS_USUARIO_FECHAMENTO);
  const codigoCliente = lerCampo(registro, CAMPOS_CODIGO_CLIENTE);
  const numeroOs = lerCampo(registro, CAMPOS_NUMERO_OS);
  const etapaInstalacao = lerCampo(registro, CAMPOS_ETAPA_INSTALACAO);
  const statusInstalacao = lerCampo(registro, CAMPOS_STATUS_INSTALACAO);
  const motivoInstalacao = lerCampo(registro, CAMPOS_MOTIVO_INSTALACAO);
  const conta = inferirConta(
    numeroOs,
    urlMetabase,
    usuarioFechamento,
    contaOrigem,
  );

  return {
    id: `${conta}-${codigoCliente}-${numeroOs}-${index}`,
    codigo_cliente: codigoCliente,
    nome_cliente: lerCampo(registro, CAMPOS_NOME_CLIENTE),
    numero_ordem_servico: numeroOs,
    usuario_fechamento: usuarioFechamento,
    usuario_fechamento_limpo: limparNomeTecnico(usuarioFechamento),
    usuario_abertura: lerCampo(registro, CAMPOS_USUARIO_ABERTURA),
    tipo_ordem_servico: tipoOrdemServico,
    data_termino_executado: formatarDataTermino(
      lerCampo(registro, CAMPOS_DATA_TERMINO),
    ),
    cidade: lerCampo(registro, CAMPOS_CIDADE),
    estado: lerCampo(registro, CAMPOS_ESTADO),
    bairro: lerCampo(registro, CAMPOS_BAIRRO),
    motivo_fechamento: lerCampo(registro, CAMPOS_MOTIVO_FECHAMENTO),
    etapa_instalacao: etapaInstalacao,
    status_instalacao: statusInstalacao,
    motivo_instalacao: motivoInstalacao,
    status_auditoria: classificarStatusAuditoria(motivoInstalacao, conta),
    conta,
    tecnico_id: null,
  };
};

export const isEquipeLobatos = (usuarioOrigem: string): boolean => {
  const nome = normalizarTexto(usuarioOrigem);
  return nome.includes("TEC_LOBATOS") || nome.includes("TEC LOBATOS");
};

export const isLiderEquipeLobatos = (nomeTecnico: string): boolean => {
  const cadastro = normalizarTexto(nomeTecnico);
  return (
    cadastro.includes("LEIDINALDO") ||
    cadastro.includes("LOBATOS") ||
    cadastro.includes("LOBATO")
  );
};

export const TECNICO_SINTETICO_LOBATOS: TecnicoFechamentoResponseDto = {
  id: "equipe-tec-lobatos",
  name: "Leidinaldo Lobato da Fonseca",
  conta: Host.AMAZONET,
};

export const osPertenceAoTecnico = (
  usuarioOrigem: string,
  nomeTecnico: string,
): boolean => {
  const usuarioNormalizado = normalizarTexto(limparNomeTecnico(usuarioOrigem));
  const cadastro = normalizarTexto(nomeTecnico);

  if (!cadastro) {
    return false;
  }

  if (isEquipeLobatos(usuarioOrigem) && isLiderEquipeLobatos(nomeTecnico)) {
    return true;
  }

  if (!usuarioNormalizado) {
    return false;
  }

  return (
    usuarioNormalizado === cadastro ||
    usuarioNormalizado.includes(cadastro) ||
    cadastro.includes(usuarioNormalizado)
  );
};

export const encontrarLiderLobatos = (
  tecnicos: TecnicoFechamentoResponseDto[],
): TecnicoFechamentoResponseDto | undefined =>
  tecnicos.find((tecnico) => isLiderEquipeLobatos(tecnico.name));

const encontrarTecnicoDaOrdem = (
  ordem: OrdemServicoInstalacaoResponseDto,
  tecnicos: TecnicoFechamentoResponseDto[],
): TecnicoFechamentoResponseDto | undefined => {
  if (isEquipeLobatos(ordem.usuario_fechamento)) {
    return (
      encontrarLiderLobatos(
        tecnicos.filter((tecnico) => tecnico.conta === ordem.conta),
      ) ??
      encontrarLiderLobatos(tecnicos) ??
      TECNICO_SINTETICO_LOBATOS
    );
  }

  const porNome = (lista: TecnicoFechamentoResponseDto[]) =>
    lista.find((tecnico) =>
      osPertenceAoTecnico(ordem.usuario_fechamento, tecnico.name),
    );

  return (
    porNome(tecnicos.filter((tecnico) => tecnico.conta === ordem.conta)) ??
    porNome(tecnicos)
  );
};

export const filtrarInstalacoesDosTecnicos = (
  ordens: OrdemServicoInstalacaoResponseDto[],
  tecnicos: TecnicoFechamentoResponseDto[],
): OrdemServicoInstalacaoResponseDto[] => {
  return ordens.flatMap((ordem) => {
    const tecnico = encontrarTecnicoDaOrdem(ordem, tecnicos);

    if (!tecnico) {
      return [];
    }

    return [
      {
        ...ordem,
        tecnico_id: tecnico.id,
        usuario_fechamento_limpo: tecnico.name,
      },
    ];
  });
};

export const mapearInstalacoesTecnicas = (
  rows: unknown,
  urlMetabase: string,
  contaOrigem?: Host,
): OrdemServicoInstalacaoResponseDto[] => {
  const linhas = extrairLinhasMetabase(rows);

  return linhas.flatMap((row, index) => {
    const mapped = mapearLinhaInstalacaoTecnica(
      row,
      index,
      urlMetabase,
      contaOrigem,
    );
    return mapped ? [mapped] : [];
  });
};
