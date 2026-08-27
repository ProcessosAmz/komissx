import { Test } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { Host } from "@/common/enums/host.enum";
import { MetaService } from "@/integrations/service/metabase.service";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { ReportService } from "@/module/reports/service/reports.service";
import { Role } from "@/module/roles/entities/role.entity";
import { Empresas } from "@/module/empresas/entities/empresas.entity";
import { Unidades } from "@/module/unidades/entities/unidades.entity";
import { Users } from "@/module/users/entities/users.entity";
import { UsersRepository } from "@/module/users/repository/index.repository";

const METABASE_JSON_URL =
  "https://amazonet.hubsoft.com.br:8443/api/public/card/3794d645-c188-449b-bc8d-ee7863714238/query/json";
const TECNICO_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
const TECNICO_ROLE_ID = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
const EMPRESA_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const UNIDADE_ID = "c56a4180-65aa-42ec-a945-5fd21dec0538";

const makeRelatorioTecnicoDto = (
  overrides: Partial<RelatorioTecnicoDto> = {},
): RelatorioTecnicoDto => ({
  dataInicio: "2026-08-20",
  dataFim: "2026-08-27",
  ...overrides,
});

const makeMetabaseRow = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  codigo_cliente: 20455,
  numero_ordem_servico: "85961",
  usuario_fechamento: "Edinelson Moura de Lima_TEC_TERC_MAO",
  usuario_abertura: "Ariedina Augusta Feitosa Soares",
  tipo_ordem_servico: "INSTALAÇÃO FTTH",
  data_termino_executado: "2026-08-21T15:40:00.000Z",
  status_auditoria: "APROVADO",
  ...overrides,
});

const makeRole = (overrides: Partial<Role> = {}): Role => ({
  id: TECNICO_ROLE_ID,
  name: "TECNICO",
  createdAt: new Date("2026-01-15T10:00:00.000Z"),
  updatedAt: new Date("2026-01-15T10:00:00.000Z"),
  users: [],
  ...overrides,
});

const makeEmpresa = (overrides: Partial<Empresas> = {}): Empresas => ({
  id: EMPRESA_ID,
  name: "Amazonet",
  active: true,
  unidades: [],
  users: [],
  createdAt: new Date("2026-01-15T10:00:00.000Z"),
  updatedAt: new Date("2026-01-15T10:00:00.000Z"),
  ...overrides,
});

const makeUnidade = (overrides: Partial<Unidades> = {}): Unidades => ({
  id: UNIDADE_ID,
  name: "Manaus",
  empresaId: EMPRESA_ID,
  estadoId: null,
  cidadeId: null,
  empresa: makeEmpresa(),
  estado: null,
  cidade: null,
  users: [],
  active: true,
  createdAt: new Date("2026-01-15T10:00:00.000Z"),
  updatedAt: new Date("2026-01-15T10:00:00.000Z"),
  ...overrides,
});

const makeTecnico = (overrides: Partial<Users> = {}): Users => ({
  id: TECNICO_ID,
  name: "Edinelson Moura de Lima",
  email: "edinelson.lima@amazonet.com",
  password: "senha-segura",
  hubsoftId: 18422,
  roleId: TECNICO_ROLE_ID,
  empresaId: EMPRESA_ID,
  unidadeId: UNIDADE_ID,
  supervisorId: null,
  participaFechamento: true,
  active: true,
  createdAt: new Date("2026-01-15T10:00:00.000Z"),
  updatedAt: new Date("2026-01-15T10:00:00.000Z"),
  role: makeRole(),
  empresa: makeEmpresa(),
  unidade: makeUnidade(),
  supervisor: null,
  liderados: [],
  ...overrides,
});

const mockMetaService = {
  vendasTecnico: jest.fn(),
  getInstalacaoTecnicoUrl: jest.fn(),
};

const mockUsersRepository = {
  findAll: jest.fn(),
};

describe("ReportService", () => {
  let sut: ReportService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: MetaService, useValue: mockMetaService },
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    sut = module.get<ReportService>(ReportService);
  });

  afterEach(() => jest.clearAllMocks());

  describe("buscarInstalacaoTecnica (success)", () => {
    it("should return only installations of technicians from the database", async () => {
      const dto = makeRelatorioTecnicoDto();
      mockMetaService.vendasTecnico.mockResolvedValueOnce([
        makeMetabaseRow(),
        makeMetabaseRow({
          codigo_cliente: 10023,
          numero_ordem_servico: "85960",
          usuario_fechamento: "Tecnico Avulso_TEC_MAO",
        }),
      ]);
      mockMetaService.getInstalacaoTecnicoUrl.mockReturnValueOnce(
        METABASE_JSON_URL,
      );
      mockUsersRepository.findAll.mockResolvedValueOnce([makeTecnico()]);

      const result = await sut.buscarInstalacaoTecnica(dto);

      expect(result).toEqual({
        data: [
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
            tecnico_id: TECNICO_ID,
          },
        ],
        tecnicos: [{ id: TECNICO_ID, name: "Edinelson Moura de Lima" }],
        message: "Instalações listadas com sucesso",
      });
      expect(mockMetaService.vendasTecnico).toHaveBeenCalledTimes(1);
      expect(mockMetaService.vendasTecnico).toHaveBeenCalledWith(dto);
      expect(mockUsersRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("buscarInstalacaoTecnica (error)", () => {
    it("should rethrow InternalServerErrorException from metabase", async () => {
      mockMetaService.vendasTecnico.mockRejectedValueOnce(
        new InternalServerErrorException("Erro ao buscar instalações no Metabase"),
      );
      mockUsersRepository.findAll.mockResolvedValueOnce([makeTecnico()]);

      await expect(
        sut.buscarInstalacaoTecnica(makeRelatorioTecnicoDto()),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
