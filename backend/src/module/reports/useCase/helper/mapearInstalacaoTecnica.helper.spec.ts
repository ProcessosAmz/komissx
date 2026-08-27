import { Host } from "@/common/enums/host.enum";
import {
  classificarStatusAuditoria,
  filtrarInstalacoesDosTecnicos,
  inferirConta,
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
  codigo_cliente: 20455,
  numero_ordem_servico: "85961",
  usuario_fechamento: "Edinelson Moura de Lima_TEC_TERC_MAO",
  usuario_abertura: "Ariedina Augusta Feitosa Soares",
  tipo_ordem_servico: "INSTALAÇÃO FTTH",
  data_termino_executado: "2026-08-21T15:40:00.000Z",
  status_auditoria: "AUDITORIA - INSTALAÇÃO APROVADA",
  ...overrides,
});

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

  describe("classificarStatusAuditoria", () => {
    it("should classify approved audit statuses", () => {
      expect(classificarStatusAuditoria("AUDITORIA - INSTALAÇÃO APROVADA")).toBe(
        "APROVADO",
      );
    });

    it("should classify non-compliance as NC APROVADO", () => {
      expect(classificarStatusAuditoria("QUALIDADE - NÃO CONFORMIDADE")).toBe(
        "NC APROVADO",
      );
    });
  });

  describe("mapearInstalacoesTecnicas", () => {
    it("should map metabase rows into the technician closing contract", () => {
      const result = mapearInstalacoesTecnicas(
        [makeMetabaseRow()],
        METABASE_JSON_URL,
      );

      expect(result).toEqual([
        {
          id: "amazonet-20455-85961-0",
          codigo_cliente: "20455",
          numero_ordem_servico: "85961",
          usuario_fechamento: "Edinelson Moura de Lima_TEC_TERC_MAO",
          usuario_fechamento_limpo: "Edinelson Moura de Lima",
          usuario_abertura: "Ariedina Augusta Feitosa Soares",
          tipo_ordem_servico: "INSTALAÇÃO FTTH",
          data_termino_executado: "2026-08-21",
          status_auditoria: "APROVADO",
          conta: Host.AMAZONET,
          tecnico_id: null,
        },
      ]);
    });

    it("should infer mania account from the technician suffix", () => {
      const result = mapearInstalacoesTecnicas(
        [makeMetabaseRow({ usuario_fechamento: "Gabriel Souza_MANIA" })],
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
            codigo_cliente: 10023,
            numero_ordem_servico: "85960",
            usuario_fechamento: "Tecnico Avulso_TEC_MAO",
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
      expect(osPertenceAoTecnico("Edinelson Moura de Lima_TEC_TERC_MAO", "Edinelson Moura de Lima")).toBe(
        true,
      );
    });
  });
});
