import { Host } from "@/common/enums/host.enum";
import {
  classificarStatusAuditoria,
  filtrarInstalacoesDosTecnicos,
  inferirConta,
  isOsInstalacao,
  limparNomeTecnico,
  mapearInstalacoesTecnicas,
  osPertenceAoTecnico,
  toMetabaseJsonUrl,
} from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";

const METABASE_PUBLIC_QUESTION =
  "https://amazonet.hubsoft.com.br:8443/public/question/3794d645-c188-449b-bc8d-ee7863714238";
const METABASE_JSON_URL =
  "https://amazonet.hubsoft.com.br:8443/api/public/card/3794d645-c188-449b-bc8d-ee7863714238/query/json";

const makeMetabaseRow = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  codigo_cliente: "177303",
  nome_razaosocial: "Manuele Moura de Andrade",
  numero_ordem_servico: "003226237083638768",
  usuario_fechamento_os: "Edinelson Moura de Lima_TEC_TERC_MAO",
  usuario_abertura_os: "Rodrigo Araujo da Silva_CMRC_MTA_EXT",
  tipo_os: "INSTALAÇÃO GRÁTIS",
  data_termino_executado: "2026-08-21T15:40:00.000Z",
  cidade: "Monte Alegre",
  estado: "PA",
  bairro: "Curaxi 2",
  motivo_fechamento: "INSTALAÇÃO CONCLUÍDA COM SUCESSO",
  etapa_instalacao: "APROVADO",
  status_instalacao: "Resolvido",
  motivo_instalacao: "Auditoria - Instalação aprovada",
  ...overrides,
});

const ordemEsperadaEdinelson = {
  id: "amazonet-177303-003226237083638768-0",
  codigo_cliente: "177303",
  nome_cliente: "Manuele Moura de Andrade",
  numero_ordem_servico: "003226237083638768",
  usuario_fechamento: "Edinelson Moura de Lima_TEC_TERC_MAO",
  usuario_fechamento_limpo: "Edinelson Moura de Lima",
  usuario_abertura: "Rodrigo Araujo da Silva_CMRC_MTA_EXT",
  tipo_ordem_servico: "INSTALAÇÃO GRÁTIS",
  data_termino_executado: "2026-08-21",
  cidade: "Monte Alegre",
  estado: "PA",
  bairro: "Curaxi 2",
  motivo_fechamento: "INSTALAÇÃO CONCLUÍDA COM SUCESSO",
  etapa_instalacao: "APROVADO",
  status_instalacao: "Resolvido",
  motivo_instalacao: "Auditoria - Instalação aprovada",
  status_auditoria: "APROVADO",
  conta: Host.AMAZONET,
  tecnico_id: null,
};

describe("mapearInstalacaoTecnica.helper", () => {
  afterEach(() => jest.clearAllMocks());

  describe("toMetabaseJsonUrl", () => {
    it("should convert a public question url into the json query endpoint", () => {
      expect(toMetabaseJsonUrl(METABASE_PUBLIC_QUESTION)).toBe(METABASE_JSON_URL);
    });
  });

  describe("limparNomeTecnico", () => {
    it("should keep the technician name before the hubsoft suffix", () => {
      expect(limparNomeTecnico("Edinelson Moura de Lima_TEC_TERC_MAO")).toBe(
        "Edinelson Moura de Lima",
      );
    });
  });

  describe("isOsInstalacao", () => {
    it("should accept paid and free installation types", () => {
      expect(isOsInstalacao("INSTALAÇÃO GRÁTIS")).toBe(true);
      expect(isOsInstalacao("INSTALAÇÃO (R$ 100,00)")).toBe(true);
    });

    it("should reject quality and non-installation orders", () => {
      expect(isOsInstalacao("AMZ QUALIDADE - PÓS VENDA (INSTALAÇÃO)")).toBe(false);
      expect(isOsInstalacao("RETIRADA DE EQUIPAMENTOS")).toBe(false);
    });
  });

  describe("classificarStatusAuditoria", () => {
    it("should classify approved installation audits", () => {
      expect(
        classificarStatusAuditoria(
          "APROVADO",
          "Resolvido",
          "Auditoria - Instalação aprovada",
        ),
      ).toBe("APROVADO");
    });

    it("should keep non-compliance pending until NC is approved", () => {
      expect(
        classificarStatusAuditoria(
          "NÃO CONFORMIDADE",
          "Qualidade - Não Conformidade",
          "",
        ),
      ).toBe("PENDENTE");
    });
  });

  describe("mapearInstalacoesTecnicas", () => {
    it("should map metabase installation rows into the technician closing contract", () => {
      const result = mapearInstalacoesTecnicas(
        [makeMetabaseRow(), makeMetabaseRow({ tipo_os: "RETIRADA DE EQUIPAMENTOS" })],
        METABASE_JSON_URL,
      );

      expect(result).toEqual([ordemEsperadaEdinelson]);
    });

    it("should infer mania account from the technician suffix", () => {
      const result = mapearInstalacoesTecnicas(
        [makeMetabaseRow({ usuario_fechamento_os: "Gabriel Souza_MANIA" })],
        METABASE_JSON_URL,
      );

      expect(result[0].conta).toBe(Host.MANIA);
      expect(inferirConta(METABASE_JSON_URL, "Gabriel Souza_MANIA")).toBe(
        Host.MANIA,
      );
    });
  });

  describe("filtrarInstalacoesDosTecnicos", () => {
    it("should keep only orders that belong to technicians from the database", () => {
      const ordens = mapearInstalacoesTecnicas(
        [
          makeMetabaseRow(),
          makeMetabaseRow({
            codigo_cliente: "10023",
            numero_ordem_servico: "85960",
            usuario_fechamento_os: "Tecnico Avulso_TEC_MAO",
          }),
        ],
        METABASE_JSON_URL,
      );

      const result = filtrarInstalacoesDosTecnicos(ordens, [
        {
          id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          name: "Edinelson Moura de Lima",
        },
      ]);

      expect(result).toEqual([
        {
          ...ordens[0],
          tecnico_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          usuario_fechamento_limpo: "Edinelson Moura de Lima",
        },
      ]);
      expect(
        osPertenceAoTecnico(
          "Edinelson Moura de Lima_TEC_TERC_MAO",
          "Edinelson Moura de Lima",
        ),
      ).toBe(true);
    });
  });
});
