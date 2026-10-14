import { BadRequestException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { FinancialClosesService } from "@/module/financial-closes/financial-closes.service";

describe("FinancialClosesService", () => {
  let service: FinancialClosesService;
  let dataSource: { query: jest.Mock; transaction: jest.Mock };

  beforeEach(() => {
    dataSource = {
      query: jest.fn(),
      transaction: jest.fn(),
    };
    service = new FinancialClosesService(dataSource as unknown as DataSource);
  });

  describe("list", () => {
    it("rejects modalities outside the authorized scope", async () => {
      await expect(service.list("TECNICO_TERCEIRIZADOS")).rejects.toBeInstanceOf(BadRequestException);
      expect(dataSource.query).not.toHaveBeenCalled();
    });

    it("lists closes when the modality is supported", async () => {
      dataSource.query.mockResolvedValue([{ id: "close-1", modality: "RETIRADA" }]);

      await expect(service.list("RETIRADA")).resolves.toEqual([
        { id: "close-1", modality: "RETIRADA" },
      ]);
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM financial_closes"),
        ["RETIRADA"],
      );
    });

    it("lists all supported modalities when no filter is provided", async () => {
      dataSource.query.mockResolvedValue([]);

      await expect(service.list()).resolves.toEqual([]);
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE ($1::varchar IS NULL OR m.key = $1)"),
        [null],
      );
    });
  });

  describe("create", () => {
    const user = { id: "admin-1" } as any;
    const validDto = {
      modality: "RETIRADA",
      company: "AMZ",
      periodStart: "2026-10-01",
      periodEnd: "2026-10-07",
      competenceStart: "2026-10-01",
      competenceEnd: "2026-10-07",
    } as any;

    it("rejects Técnico Terceirizados without opening a transaction", async () => {
      await expect(
        service.create({ ...validDto, modality: "TECNICO_TERCEIRIZADOS" }, user),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it("rejects inverted periods", async () => {
      await expect(
        service.create({ ...validDto, periodStart: "2026-10-08", periodEnd: "2026-10-07" }, user),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it("rejects inverted competence dates", async () => {
      await expect(
        service.create({ ...validDto, competenceStart: "2026-10-08", competenceEnd: "2026-10-07" }, user),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it("accepts Vendas Autônomos as an in-scope modality", async () => {
      dataSource.transaction.mockImplementation(async (callback: (manager: any) => Promise<any>) =>
        callback({
          query: jest.fn()
            .mockResolvedValueOnce([{ id: "mod-2" }])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ id: "close-2", status: "PREPARACAO" }])
            .mockResolvedValueOnce([]),
        }),
      );

      await expect(
        service.create({ ...validDto, modality: "VENDAS_AUTONOMOS" }, user),
      ).resolves.toEqual({ id: "close-2", status: "PREPARACAO" });
    });
  });
});
