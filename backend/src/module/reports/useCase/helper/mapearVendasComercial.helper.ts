import { Host } from "@/common/enums/host.enum";
import {
  CAMPOS_CODIGO_CLIENTE_VENDA,
  CAMPOS_DATA_CADASTRO,
  CAMPOS_DATA_TERMINO_VENDA,
  CAMPOS_ID_ATENDIMENTO,
  CAMPOS_ID_CLIENTE,
  CAMPOS_MOTIVO_FECHAMENTO_VENDA,
  CAMPOS_NOME_CLIENTE_VENDA,
  CAMPOS_NOME_SERVICO,
  CAMPOS_NUMERO_OS_VENDA,
  CAMPOS_STATUS_ATENDIMENTO,
  CAMPOS_STATUS_AUDITORIA_VENDA,
  CAMPOS_TIPO_OS_VENDA,
  CAMPOS_USUARIO_CADASTRO,
  CAMPOS_VALOR_SERVICO,
  CAMPOS_VENDEDOR,
} from "@/module/reports/constants/camposMetabaseVendasComercial.constants";
import {
  ColaboradorComercialResponseDto,
  VendaComercialResponseDto,
} from "@/module/reports/dto/vendasComercial.response.dto";
import {
  empresaParaConta,
  extrairLinhasMetabase,
  inferirConta,
  normalizarTexto,
} from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";

const CARGOS_FORA_DO_COMERCIAL = new Set([
  "ADMIN",
  "GERENTE",
  "TECNICO",
  "AUTONOMO",
]);

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
    const match = entries.find(
      ([key]) => key.toLowerCase().trim() === alias.toLowerCase(),
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

export type UsuarioHierarquiaComercial = {
  id: string;
  name: string;
  roleName: string;
  supervisorId: string | null;
  supervisorName: string | null;
  unidadeName: string;
  empresaName: string;
};

export const isSupervisorRole = (roleName: string): boolean =>
  normalizarTexto(roleName).includes("SUPERVISOR");

export const isLiderRole = (roleName: string): boolean => {
  const cargo = normalizarTexto(roleName);
  return cargo.includes("LIDER") && !cargo.includes("SUPERVISOR");
};

export const isCargoComercial = (roleName: string): boolean =>
  !CARGOS_FORA_DO_COMERCIAL.has(normalizarTexto(roleName));

export const limparNomeVendedor = (vendedor: string): string => {
  const nome = vendedor.trim();
  const indiceSufixo = nome.indexOf("_");

  if (indiceSufixo <= 0) {
    return nome;
  }

  return nome.slice(0, indiceSufixo).trim();
};

export const toColaboradorComercial = (
  usuario: UsuarioHierarquiaComercial,
): ColaboradorComercialResponseDto => ({
  id: usuario.id,
  name: usuario.name,
  roleName: usuario.roleName,
  supervisorId: usuario.supervisorId,
  supervisorName: usuario.supervisorName,
  unidadeName: usuario.unidadeName,
  conta: empresaParaConta(usuario.empresaName),
  isLider: isLiderRole(usuario.roleName),
  isSupervisor: isSupervisorRole(usuario.roleName),
});

export const coletarDescendentes = (
  usuarios: UsuarioHierarquiaComercial[],
  raizId: string,
): UsuarioHierarquiaComercial[] => {
  const filhosPorPai = new Map<string, UsuarioHierarquiaComercial[]>();

  for (const usuario of usuarios) {
    if (!usuario.supervisorId) {
      continue;
    }

    const irmaos = filhosPorPai.get(usuario.supervisorId) ?? [];
    irmaos.push(usuario);
    filhosPorPai.set(usuario.supervisorId, irmaos);
  }

  const descendentes: UsuarioHierarquiaComercial[] = [];
  const fila = [...(filhosPorPai.get(raizId) ?? [])];

  while (fila.length > 0) {
    const atual = fila.shift();

    if (!atual) {
      continue;
    }

    descendentes.push(atual);
    fila.push(...(filhosPorPai.get(atual.id) ?? []));
  }

  return descendentes;
};

export const resolverEquipeComercial = (
  usuarios: UsuarioHierarquiaComercial[],
  liderId?: string,
): {
  selecionado: UsuarioHierarquiaComercial | null;
  equipe: UsuarioHierarquiaComercial[];
  paraMatch: UsuarioHierarquiaComercial[];
} => {
  const comerciais = usuarios.filter((usuario) =>
    isCargoComercial(usuario.roleName),
  );

  if (!liderId) {
    return {
      selecionado: null,
      equipe: comerciais,
      paraMatch: comerciais,
    };
  }

  const selecionado =
    comerciais.find((usuario) => usuario.id === liderId) ?? null;

  if (!selecionado) {
    return { selecionado: null, equipe: [], paraMatch: [] };
  }

  const equipe = coletarDescendentes(comerciais, selecionado.id);

  return {
    selecionado,
    equipe,
    paraMatch: [selecionado, ...equipe],
  };
};

const parseValorServico = (valor: string): number => {
  if (!valor) {
    return 0;
  }

  const parsed = Number(valor.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const mapearLinhaVendaComercial = (
  row: unknown,
  index: number,
  urlMetabase: string,
  contaOrigem?: Host,
): VendaComercialResponseDto => {
  const registro = toRecord(row);
  const vendedor = lerCampo(registro, CAMPOS_VENDEDOR);
  const numeroOs = lerCampo(registro, CAMPOS_NUMERO_OS_VENDA);
  const codigoCliente = lerCampo(registro, CAMPOS_CODIGO_CLIENTE_VENDA);
  const conta = inferirConta(numeroOs, urlMetabase, vendedor, contaOrigem);

  return {
    id: `${conta}-${codigoCliente}-${numeroOs}-${index}`,
    tipo_ordem_servico: lerCampo(registro, CAMPOS_TIPO_OS_VENDA),
    numero_ordem_servico: numeroOs,
    id_atendimento: lerCampo(registro, CAMPOS_ID_ATENDIMENTO),
    codigo_cliente: codigoCliente,
    nome_cliente: lerCampo(registro, CAMPOS_NOME_CLIENTE_VENDA),
    id_cliente: lerCampo(registro, CAMPOS_ID_CLIENTE),
    nome_servico: lerCampo(registro, CAMPOS_NOME_SERVICO),
    vendedor,
    vendedor_limpo: limparNomeVendedor(vendedor),
    usuario_cadastro: lerCampo(registro, CAMPOS_USUARIO_CADASTRO),
    status_atendimento: lerCampo(registro, CAMPOS_STATUS_ATENDIMENTO),
    status_auditoria: lerCampo(registro, CAMPOS_STATUS_AUDITORIA_VENDA),
    motivo_fechamento: lerCampo(registro, CAMPOS_MOTIVO_FECHAMENTO_VENDA),
    data_cadastro: lerCampo(registro, CAMPOS_DATA_CADASTRO),
    data_termino_executado: lerCampo(registro, CAMPOS_DATA_TERMINO_VENDA),
    valor_servico: parseValorServico(lerCampo(registro, CAMPOS_VALOR_SERVICO)),
    conta,
    colaborador_id: null,
    venda_do_lider: false,
  };
};

export const mapearVendasComerciais = (
  rows: unknown,
  urlMetabase: string,
  contaOrigem?: Host,
): VendaComercialResponseDto[] => {
  const linhas = extrairLinhasMetabase(rows);

  return linhas.map((row, index) =>
    mapearLinhaVendaComercial(row, index, urlMetabase, contaOrigem),
  );
};

export const encontrarColaboradorDaVenda = (
  venda: VendaComercialResponseDto,
  colaboradores: UsuarioHierarquiaComercial[],
): UsuarioHierarquiaComercial | undefined => {
  const usuarioCadastro = normalizarTexto(
    limparNomeVendedor(venda.usuario_cadastro),
  );

  if (!usuarioCadastro) {
    return undefined;
  }

  const correspondencias = colaboradores.filter(
    (colaborador) => normalizarTexto(colaborador.name) === usuarioCadastro,
  );

  return (
    correspondencias.find(
      (colaborador) =>
        empresaParaConta(colaborador.empresaName) === venda.conta,
    ) ?? correspondencias[0]
  );
};

export const filtrarVendasDaEquipe = (
  vendas: VendaComercialResponseDto[],
  paraMatch: UsuarioHierarquiaComercial[],
  liderId?: string,
): VendaComercialResponseDto[] => {
  return vendas.flatMap((venda) => {
    const colaborador = encontrarColaboradorDaVenda(venda, paraMatch);

    if (!colaborador) {
      return [];
    }

    return [
      {
        ...venda,
        colaborador_id: colaborador.id,
        venda_do_lider: Boolean(liderId) && colaborador.id === liderId,
      },
    ];
  });
};
