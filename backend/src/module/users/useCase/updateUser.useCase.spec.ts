import { Test } from "@nestjs/testing";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { BetterAuthRepository } from "@/module/auth/repository/betterAuth.repository";
import { Empresas } from "@/module/empresas/entities/empresas.entity";
import { Role } from "@/module/roles/entities/role.entity";
import { RolesRepository } from "@/module/roles/repository/index.repository";
import { Unidades } from "@/module/unidades/entities/unidades.entity";
import { Users } from "@/module/users/entities/users.entity";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { UpdateUserUseCase } from "@/module/users/useCase/updateUser.useCase";

const USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const LIDER_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const SUPERVISOR_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
const SUPERVISOR_ROLE_ID = "550e8400-e29b-41d4-a716-446655440000";
const LIDER_ROLE_ID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const TECNICO_ROLE_ID = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
const EMPRESA_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const UNIDADE_ID = "c56a4180-65aa-42ec-a945-5fd21dec0538";

const makeRole = (overrides: Partial<Role> = {}): Role => ({
  id: SUPERVISOR_ROLE_ID,
  name: "SUPERVISOR",
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

const makeUser = (overrides: Partial<Users> = {}): Users => ({
  id: USER_ID,
  name: "Carlos Ferreira",
  email: "carlos.ferreira@amazonet.com",
  password: "$2b$10$hashedPasswordAmazonet12",
  hubsoftId: 18420,
  roleId: SUPERVISOR_ROLE_ID,
  empresaId: EMPRESA_ID,
  unidadeId: UNIDADE_ID,
  supervisorId: null,
  role: makeRole(),
  empresa: makeEmpresa(),
  unidade: makeUnidade(),
  supervisor: null,
  liderados: [],
  participaFechamento: true,
  active: true,
  createdAt: new Date("2026-01-15T10:00:00.000Z"),
  updatedAt: new Date("2026-01-15T10:00:00.000Z"),
  ...overrides,
});

const mockUsersRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByIdWithRole: jest.fn(),
  countBySupervisorId: jest.fn(),
  update: jest.fn(),
};

const mockRolesRepository = {
  findById: jest.fn(),
};

const mockBetterAuthRepository = {
  hashPassword: jest.fn(),
  updateCredentialUser: jest.fn(),
  updatePassword: jest.fn(),
};

describe("UpdateUserUseCase", () => {
  let sut: UpdateUserUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: RolesRepository, useValue: mockRolesRepository },
        { provide: BetterAuthRepository, useValue: mockBetterAuthRepository },
      ],
    }).compile();

    sut = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  describe("execute (success)", () => {
    it("should update name, email and cargo", async () => {
      const user = makeUser();
      const updatedUser = makeUser({
        name: "Carlos Mendes",
        email: "carlos.mendes@amazonet.com",
        roleId: LIDER_ROLE_ID,
        supervisorId: SUPERVISOR_ID,
      });

      mockUsersRepository.findById.mockResolvedValueOnce(user);
      mockUsersRepository.findByEmail.mockResolvedValueOnce(null);
      mockRolesRepository.findById.mockResolvedValueOnce(
        makeRole({ id: LIDER_ROLE_ID, name: "LIDER" }),
      );
      mockUsersRepository.findByIdWithRole.mockResolvedValueOnce(
        makeUser({
          id: SUPERVISOR_ID,
          name: "Marina Souza",
          email: "marina.souza@amazonet.com",
          role: makeRole(),
        }),
      );
      mockUsersRepository.countBySupervisorId.mockResolvedValueOnce(0);
      mockUsersRepository.update.mockResolvedValueOnce(updatedUser);
      mockBetterAuthRepository.updateCredentialUser.mockResolvedValueOnce(
        undefined,
      );

      const result = await sut.execute(USER_ID, {
        name: "Carlos Mendes",
        email: "carlos.mendes@amazonet.com",
        roleId: LIDER_ROLE_ID,
        supervisorId: SUPERVISOR_ID,
      });

      expect(result.message).toBe("Usuário atualizado com sucesso");
      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        user,
        expect.objectContaining({
          name: "Carlos Mendes",
          email: "carlos.mendes@amazonet.com",
          roleId: LIDER_ROLE_ID,
          supervisorId: SUPERVISOR_ID,
        }),
      );
    });

    it("should clear supervisor when cargo becomes supervisor", async () => {
      const user = makeUser({
        roleId: LIDER_ROLE_ID,
        supervisorId: SUPERVISOR_ID,
      });

      mockUsersRepository.findById.mockResolvedValueOnce(user);
      mockRolesRepository.findById.mockResolvedValueOnce(makeRole());
      mockUsersRepository.countBySupervisorId.mockResolvedValueOnce(0);
      mockUsersRepository.update.mockResolvedValueOnce(
        makeUser({ supervisorId: null }),
      );
      mockBetterAuthRepository.updateCredentialUser.mockResolvedValueOnce(
        undefined,
      );

      await sut.execute(USER_ID, { roleId: SUPERVISOR_ROLE_ID });

      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        user,
        expect.objectContaining({ supervisorId: null }),
      );
    });

    it("should hash password only when a new password is sent", async () => {
      const user = makeUser();
      const passwordHash = "$2b$10$newHashedPasswordAmazonet";

      mockUsersRepository.findById.mockResolvedValueOnce(user);
      mockRolesRepository.findById.mockResolvedValueOnce(makeRole());
      mockUsersRepository.countBySupervisorId.mockResolvedValueOnce(0);
      mockBetterAuthRepository.hashPassword.mockResolvedValueOnce(passwordHash);
      mockUsersRepository.update.mockResolvedValueOnce(user);
      mockBetterAuthRepository.updateCredentialUser.mockResolvedValueOnce(
        undefined,
      );
      mockBetterAuthRepository.updatePassword.mockResolvedValueOnce(undefined);

      await sut.execute(USER_ID, { password: "novaSenha123" });

      expect(mockBetterAuthRepository.hashPassword).toHaveBeenCalledWith(
        "novaSenha123",
      );
      expect(mockBetterAuthRepository.updatePassword).toHaveBeenCalledWith(
        USER_ID,
        passwordHash,
      );
    });
  });

  describe("execute (not found)", () => {
    it("should throw when user does not exist", async () => {
      mockUsersRepository.findById.mockResolvedValueOnce(null);

      await expect(sut.execute(USER_ID, { name: "Carlos Mendes" })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("execute (conflict)", () => {
    it("should throw when email belongs to another user", async () => {
      mockUsersRepository.findById.mockResolvedValueOnce(makeUser());
      mockUsersRepository.findByEmail.mockResolvedValueOnce(
        makeUser({
          id: LIDER_ID,
          email: "marina.souza@amazonet.com",
        }),
      );

      await expect(
        sut.execute(USER_ID, { email: "marina.souza@amazonet.com" }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it("should keep the current email without treating it as a conflict", async () => {
      const user = makeUser();

      mockUsersRepository.findById.mockResolvedValueOnce(user);
      mockUsersRepository.findByEmail.mockResolvedValueOnce(user);
      mockRolesRepository.findById.mockResolvedValueOnce(makeRole());
      mockUsersRepository.countBySupervisorId.mockResolvedValueOnce(0);
      mockUsersRepository.update.mockResolvedValueOnce(user);
      mockBetterAuthRepository.updateCredentialUser.mockResolvedValueOnce(
        undefined,
      );

      const result = await sut.execute(USER_ID, {
        email: user.email,
        name: "Carlos Ferreira",
      });

      expect(result.message).toBe("Usuário atualizado com sucesso");
    });
  });

  describe("execute (invalid cargo change)", () => {
    it("should throw when a user with reports becomes a leaf role", async () => {
      mockUsersRepository.findById.mockResolvedValueOnce(makeUser());
      mockRolesRepository.findById.mockResolvedValueOnce(
        makeRole({ id: TECNICO_ROLE_ID, name: "TECNICO" }),
      );
      mockUsersRepository.findByIdWithRole.mockResolvedValueOnce(
        makeUser({
          id: LIDER_ID,
          role: makeRole({ id: LIDER_ROLE_ID, name: "LIDER" }),
        }),
      );
      mockUsersRepository.countBySupervisorId.mockResolvedValueOnce(2);

      await expect(
        sut.execute(USER_ID, {
          roleId: TECNICO_ROLE_ID,
          supervisorId: LIDER_ID,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
