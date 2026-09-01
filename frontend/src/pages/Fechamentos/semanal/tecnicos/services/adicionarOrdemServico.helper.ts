import {
  CAMPOS_VALIDACAO_NOVA_OS,
  MOTIVO_FECHAMENTO_MANUAL,
  PREFIXO_ID_OS_MANUAL,
  TIPO_OS_MANUAL,
  USUARIO_ABERTURA_MANUAL,
} from "@/pages/Fechamentos/semanal/tecnicos/constants";
import type {
  CampoValidacaoNovaOs,
  DadosNovaOrdemServico,
} from "@/types/tecnicos";
import type { OrdemServico, StatusAuditoria } from "@/pages/Fechamentos/types";
import { STATUS_AUDITORIA_FORM } from "@/pages/Fechamentos/semanal/tecnicos/constants/statusAuditoriaForm";

const STATUS_AUDITORIA_FORM_SET = new Set<string>(STATUS_AUDITORIA_FORM);

export const isStatusAuditoriaForm = (
  valor: string,
): valor is StatusAuditoria => {
  return STATUS_AUDITORIA_FORM_SET.has(valor);
};

export const isOsManual = (id: string): boolean => {
  return id.startsWith(PREFIXO_ID_OS_MANUAL);
};

export const criarIdOsManual = (): string => {
  return `${PREFIXO_ID_OS_MANUAL}${crypto.randomUUID()}`;
};

const motivoInstalacaoPorStatus = (status: StatusAuditoria): string => {
  switch (status) {
    case "APROVADO":
      return "Auditoria - Instalação aprovada";
    case "REPROVADO":
      return "Auditoria - Instalação reprovada";
    default:
      return MOTIVO_FECHAMENTO_MANUAL;
  }
};

const mensagemCampoInvalido = (
  campo: CampoValidacaoNovaOs,
  dados: DadosNovaOrdemServico,
): string | null => {
  switch (campo) {
    case "codigoCliente":
      return dados.codigoCliente.trim().length === 0
        ? "Informe o código do cliente."
        : null;
    case "numeroOs":
      return dados.numeroOs.trim().length === 0
        ? "Informe o número da O.S."
        : null;
    case "tecnico":
      return dados.tecnicoId.trim().length === 0 ||
        dados.tecnicoNome.trim().length === 0
        ? "Selecione o técnico."
        : null;
    case "dataTermino":
      return dados.dataTermino.trim().length === 0
        ? "Informe a data de conclusão."
        : null;
  }
};

export const validarNovaOrdemServico = (
  dados: DadosNovaOrdemServico,
): string | null => {
  for (const campo of CAMPOS_VALIDACAO_NOVA_OS) {
    const mensagem = mensagemCampoInvalido(campo, dados);

    if (mensagem) {
      return mensagem;
    }
  }

  return null;
};

export const ordemManualDuplicada = (
  lista: OrdemServico[],
  dados: DadosNovaOrdemServico,
): boolean => {
  const numeroOs = dados.numeroOs.trim();
  const codigoCliente = dados.codigoCliente.trim();

  return lista.some(
    (ordem) =>
      ordem.conta === dados.empresa &&
      ordem.numero_ordem_servico.trim() === numeroOs &&
      ordem.codigo_cliente.trim() === codigoCliente,
  );
};

export const montarOrdemServicoManual = (
  dados: DadosNovaOrdemServico,
): OrdemServico => {
  const nomeTecnico = dados.tecnicoNome.trim();
  const status = dados.statusAuditoria;

  return {
    id: criarIdOsManual(),
    codigo_cliente: dados.codigoCliente.trim(),
    nome_cliente: dados.nomeCliente.trim(),
    numero_ordem_servico: dados.numeroOs.trim(),
    usuario_fechamento: nomeTecnico,
    usuario_fechamento_limpo: nomeTecnico,
    usuario_abertura: USUARIO_ABERTURA_MANUAL,
    tipo_ordem_servico: TIPO_OS_MANUAL,
    data_termino_executado: dados.dataTermino,
    cidade: dados.cidade.trim(),
    estado: dados.estado.trim().toUpperCase(),
    bairro: "",
    motivo_fechamento: MOTIVO_FECHAMENTO_MANUAL,
    etapa_instalacao: status || MOTIVO_FECHAMENTO_MANUAL,
    status_instalacao: status,
    motivo_instalacao: motivoInstalacaoPorStatus(status),
    status_auditoria: status,
    conta: dados.empresa,
    tecnico_id: dados.tecnicoId,
  };
};

export const mesclarOrdensManuais = (
  ordensAtuais: OrdemServico[],
  ordensApi: OrdemServico[],
): OrdemServico[] => {
  const manuais = ordensAtuais.filter((ordem) => isOsManual(ordem.id));
  const manuaisSemConflito = manuais.filter(
    (manual) =>
      !ordensApi.some(
        (ordem) =>
          ordem.conta === manual.conta &&
          ordem.numero_ordem_servico.trim() ===
            manual.numero_ordem_servico.trim() &&
          ordem.codigo_cliente.trim() === manual.codigo_cliente.trim(),
      ),
  );

  return [...manuaisSemConflito, ...ordensApi];
};
