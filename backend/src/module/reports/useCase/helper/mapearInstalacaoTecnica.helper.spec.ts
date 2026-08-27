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
  toDataFimExclusivaMetabase,
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

  describe("toDataFimExclusivaMetabase", () => {
    it("should convert the inclusive week end into the exclusive Metabase date", () => {
      expect(toDataFimExclusivaMetabase("2026-08-26")).toBe("2026-08-27");
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

    it("should accept address change and non-compliance quality orders", () => {
      expect(isOsInstalacao("MUDANÇA DE ENDEREÇO")).toBe(true);
      expect(isOsInstalacao("AMZ QUALIDADE - NÃO CONFORMIDADES")).toBe(true);
    });

    it("should reject post-sale quality and non-installation orders", () => {
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

    it("should classify resolved or empty audit as approved for weekly payment", () => {
      expect(classificarStatusAuditoria("", "Resolvido", "Retenção não realizada")).toBe(
        "APROVADO",
      );
      expect(classificarStatusAuditoria("", "", "")).toBe("APROVADO");
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

    it("should infer mania account from the OS prefix", () => {
      const result = mapearInstalacoesTecnicas(
        [makeMetabaseRow({ numero_ordem_servico: "004826237083638768" })],
        METABASE_JSON_URL,
      );

      expect(result[0].conta).toBe(Host.MANIA);
      expect(
        inferirConta("004826237083638768", METABASE_JSON_URL, "Gabriel Souza"),
      ).toBe(Host.MANIA);
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
          conta: Host.AMAZONET,
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

    it("should attribute TEC_LOBATOS closers to Leidinaldo Lobato", () => {
      const ordens = mapearInstalacoesTecnicas(
        [
          makeMetabaseRow({
            codigo_cliente: "188201",
            numero_ordem_servico: "003226238100000001",
            usuario_fechamento_os: "Leidinaldo Lobato da Fonseca_TEC_LOBATOS",
          }),
          makeMetabaseRow({
            codigo_cliente: "188202",
            numero_ordem_servico: "003226238100000002",
            usuario_fechamento_os: "Helio Souza_TEC_LOBATOS",
          }),
        ],
        METABASE_JSON_URL,
      );

      const result = filtrarInstalacoesDosTecnicos(ordens, [
        {
          id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
          name: "Helio Souza",
          conta: Host.AMAZONET,
        },
        {
          id: "1b4e28ba-2fa1-11d2-883f-0016d3cca427",
          name: "Leidinaldo Lobato da Fonseca",
          conta: Host.AMAZONET,
        },
      ]);

      expect(result).toHaveLength(2);
      expect(result.every((ordem) => ordem.tecnico_id === "1b4e28ba-2fa1-11d2-883f-0016d3cca427")).toBe(
        true,
      );
      expect(
        result.every(
          (ordem) =>
            ordem.usuario_fechamento_limpo === "Leidinaldo Lobato da Fonseca",
        ),
      ).toBe(true);
    it("should keep TEC_LOBATOS orders even without a registered leader", () => {
      const ordens = mapearInstalacoesTecnicas(
        [
          makeMetabaseRow({
            codigo_cliente: "177266",
            numero_ordem_servico: "003226236135117078",
            usuario_fechamento_os: "Wagner dos Santos Pinheiro_TEC_LOBATOS",
          }),
        ],
        METABASE_JSON_URL,
      );

      const result = filtrarInstalacoesDosTecnicos(ordens, []);

      expect(result).toHaveLength(1);
      expect(result[0].tecnico_id).toBe("equipe-tec-lobatos");
      expect(result[0].usuario_fechamento_limpo).toBe(
        "Leidinaldo Lobato da Fonseca",
      );
    });
  });
});
