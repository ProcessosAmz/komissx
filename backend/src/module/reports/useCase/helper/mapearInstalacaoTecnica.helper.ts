import { Host } from "@/common/enums/host.enum";
import {
  OrdemServicoInstalacaoResponseDto,
  StatusAuditoriaInstalacao,
  TecnicoFechamentoResponseDto,
} from "@/module/reports/dto/ordemServicoInstalacao.response.dto";

const CAMPOS_CODIGO_CLIENTE = ["codigo_cliente", "codigo cliente"];
const CAMPOS_NUMERO_OS = [
  "numero_ordem_servico",
  "numero_os",
  "ordem_servico",
];
const CAMPOS_USUARIO_FECHAMENTO = [
  "usuario_fechamento",
  "usuario_fechamento_os",
  "usuario_fechamento_limpo",
];
const CAMPOS_USUARIO_ABERTURA = ["usuario_abertura", "usuario_cadastro"];
const CAMPOS_TIPO_OS = ["tipo_ordem_servico", "tipo_os"];
const CAMPOS_DATA_TERMINO = [
  "data_termino_executado",
  "data_fechamento",
  "data_termino",
];
const CAMPOS_STATUS_AUDITORIA = [
  "status_auditoria",
  "motivo_auditoria",
  "motivo_comercial",
  "status",
];

const toRecord = (row: unknown): Record<string, unknown> => {
  if (row && typeof row === "object" && !Array.isArray(row)) {
    return row as Record<string, unknown>;
  }

  return {};
};

const lerCampo = (
  row: Record<string, unknown>,
  aliases: string[],
): string => {
  const entries = Object.entries(row);

  for (const alias of aliases) {
    const match = entries.find(
      ([key]) => key.toLowerCase().trim() === alias,
    );

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

export const limparNomeTecnico = (usuarioFechamento: string): string => {
  const nome = usuarioFechamento.trim();
  const indiceSufixo = nome.indexOf("_");

  if (indiceSufixo <= 0) {
    return nome;
  }

  return nome.slice(0, indiceSufixo).trim();
};

export const classificarStatusAuditoria = (
  valorBruto: string,
): StatusAuditoriaInstalacao => {
  const normalizado = valorBruto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

  if (!normalizado || normalizado === "-") {
    return "PENDENTE";
  }

  if (
    normalizado.includes("N.C") ||
    normalizado.includes("NC APROVADO") ||
    normalizado.includes("NAO CONFORMIDADE") ||
    normalizado.includes("REANALISE")
  ) {
    return "NC APROVADO";
  }

  if (normalizado.includes("REPROVADO")) {
    return "REPROVADO";
  }

  if (normalizado.includes("APROVADO")) {
    return "APROVADO";
  }

  return "PENDENTE";
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

export const inferirConta = (
  urlMetabase: string,
  usuarioFechamento: string,
): Host => {
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

export const mapearLinhaInstalacaoTecnica = (
  row: unknown,
  index: number,
  urlMetabase: string,
): OrdemServicoInstalacaoResponseDto => {
  const registro = toRecord(row);
  const usuarioFechamento = lerCampo(registro, CAMPOS_USUARIO_FECHAMENTO);
  const codigoCliente = lerCampo(registro, CAMPOS_CODIGO_CLIENTE);
  const numeroOs = lerCampo(registro, CAMPOS_NUMERO_OS);
  const conta = inferirConta(urlMetabase, usuarioFechamento);

  return {
    id: `${conta}-${codigoCliente}-${numeroOs}-${index}`,
    codigo_cliente: codigoCliente,
    numero_ordem_servico: numeroOs,
    usuario_fechamento: usuarioFechamento,
    usuario_fechamento_limpo: limparNomeTecnico(usuarioFechamento),
    usuario_abertura: lerCampo(registro, CAMPOS_USUARIO_ABERTURA),
    tipo_ordem_servico: lerCampo(registro, CAMPOS_TIPO_OS),
    data_termino_executado: formatarDataTermino(
      lerCampo(registro, CAMPOS_DATA_TERMINO),
    ),
    status_auditoria: classificarStatusAuditoria(
      lerCampo(registro, CAMPOS_STATUS_AUDITORIA),
    ),
    conta,
    tecnico_id: null,
  };
};

export const normalizarNomeTecnico = (nome: string): string =>
  nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

export const osPertenceAoTecnico = (
  usuarioHubsoft: string,
  nomeTecnico: string,
): boolean => {
  const hubsoft = normalizarNomeTecnico(limparNomeTecnico(usuarioHubsoft));
  const cadastro = normalizarNomeTecnico(nomeTecnico);

  if (!hubsoft || !cadastro) {
    return false;
  }

  return (
    hubsoft === cadastro ||
    hubsoft.includes(cadastro) ||
    cadastro.includes(hubsoft)
  );
};

export const filtrarInstalacoesDosTecnicos = (
  ordens: OrdemServicoInstalacaoResponseDto[],
  tecnicos: TecnicoFechamentoResponseDto[],
): OrdemServicoInstalacaoResponseDto[] => {
  if (tecnicos.length === 0) {
    return [];
  }

  return ordens.flatMap((ordem) => {
    const tecnico = tecnicos.find((item) =>
      osPertenceAoTecnico(ordem.usuario_fechamento, item.name),
    );

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
): OrdemServicoInstalacaoResponseDto[] => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row, index) =>
    mapearLinhaInstalacaoTecnica(row, index, urlMetabase),
  );
};
