import { UserListItem } from "@/module/users/types/user";
import { applyFilters, buildTree } from "@/module/users/useCase/helper/listUser.helper";

const SUPERVISOR_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const LIDER_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const TECNICO_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
const BACKOFFICE_ID = "1b4e28ba-2fa1-11d2-883f-0016d38d04c0";
const SUPERVISOR_ROLE_ID = "550e8400-e29b-41d4-a716-446655440000";
const LIDER_ROLE_ID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const TECNICO_ROLE_ID = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
const BACKOFFICE_ROLE_ID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";
const EMPRESA_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const UNIDADE_ID = "c56a4180-65aa-42ec-a945-5fd21dec0538";
const ESTADO_ID = "d9428888-122b-4b56-8c6b-4b5b8f0c1234";

const makeUserListItem = (overrides: Partial<UserListItem> = {}): UserListItem => ({
  id: SUPERVISOR_ID,
  name: "Carlos Ferreira",
  email: "carlos.ferreira@amazonet.com",
  hubsoftId: 18420,
  roleId: SUPERVISOR_ROLE_ID,
  roleName: "SUPERVISOR",
  empresaId: EMPRESA_ID,
  empresaName: "Amazonet",
  unidadeId: UNIDADE_ID,
  unidadeName: "Manaus",
  estadoId: ESTADO_ID,
  estadoName: "Amazonas",
  supervisorId: null,
  participaFechamento: true,
  active: true,
  ...overrides,
});

const makeHierarchy = (): UserListItem[] => [
  makeUserListItem(),
  makeUserListItem({
    id: LIDER_ID,
    name: "Marina Souza",
    email: "marina.souza@amazonet.com",
    hubsoftId: 18421,
    roleId: LIDER_ROLE_ID,
    roleName: "LIDER",
    supervisorId: SUPERVISOR_ID,
    participaFechamento: true,
  }),
  makeUserListItem({
    id: TECNICO_ID,
    name: "Joao Ribeiro",
    email: "joao.ribeiro@amazonet.com",
    hubsoftId: 18422,
    roleId: TECNICO_ROLE_ID,
    roleName: "TECNICO",
    supervisorId: LIDER_ID,
    participaFechamento: false,
  }),
  makeUserListItem({
    id: BACKOFFICE_ID,
    name: "Ana Oliveira",
    email: "ana.oliveira@amazonet.com",
    hubsoftId: 18423,
    roleId: BACKOFFICE_ROLE_ID,
    roleName: "BACKOFFICE",
    supervisorId: LIDER_ID,
    participaFechamento: false,
  }),
];

describe("listUser.helper", () => {
  afterEach(() => jest.clearAllMocks());

  describe("applyFilters (roleId)", () => {
    it("should keep ancestors when filtering by cargo", () => {
      const users = makeHierarchy();

      const result = applyFilters(users, { roleId: TECNICO_ROLE_ID });
      const resultIds = result.map((user) => user.id);

      expect(resultIds).toEqual(
        expect.arrayContaining([SUPERVISOR_ID, LIDER_ID, TECNICO_ID]),
      );
      expect(resultIds).not.toContain(BACKOFFICE_ID);
    });
  });

  describe("applyFilters (search)", () => {
    it("should keep ancestors when searching by name", () => {
      const users = makeHierarchy();

      const result = applyFilters(users, { search: "Joao" });
      const resultIds = result.map((user) => user.id);

      expect(resultIds).toEqual(
        expect.arrayContaining([SUPERVISOR_ID, LIDER_ID, TECNICO_ID]),
      );
      expect(resultIds).not.toContain(BACKOFFICE_ID);
    });
  });

  describe("applyFilters (participaFechamento)", () => {
    it("should keep only people who participate in closing and their ancestors", () => {
      const users = makeHierarchy();

      const result = applyFilters(users, { participaFechamento: true });
      const resultIds = result.map((user) => user.id);

      expect(resultIds).toEqual(
        expect.arrayContaining([SUPERVISOR_ID, LIDER_ID]),
      );
      expect(resultIds).not.toContain(TECNICO_ID);
      expect(resultIds).not.toContain(BACKOFFICE_ID);
    });
  });

  describe("applyFilters (empresa)", () => {
    it("should exclude people from another company", () => {
      const users = [
        ...makeHierarchy(),
        makeUserListItem({
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          name: "Helena Martins",
          email: "helena.martins@mania.com",
          empresaId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          empresaName: "Mania",
        }),
      ];

      const result = applyFilters(users, { empresaId: EMPRESA_ID });

      expect(result.every((user) => user.empresaId === EMPRESA_ID)).toBe(true);
    });
  });

  describe("applyFilters (admin)", () => {
    it("should exclude admin from the hierarchy", () => {
      const users = [
        ...makeHierarchy(),
        makeUserListItem({
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
          name: "Jepinha Admin",
          email: "jepinha@gmail.com",
          roleName: "ADMIN",
        }),
      ];

      const result = applyFilters(users, {});

      expect(result.some((user) => user.roleName === "ADMIN")).toBe(false);
    });
  });

  describe("buildTree (hierarchy)", () => {
    it("should nest lider and cargos under the supervisor", () => {
      const users = applyFilters(makeHierarchy(), {});

      const tree = buildTree(users);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe(SUPERVISOR_ID);
      expect(tree[0].children?.map((child) => child.id)).toEqual([LIDER_ID]);
      expect(tree[0].children?.[0].children?.map((child) => child.id)).toEqual(
        expect.arrayContaining([TECNICO_ID, BACKOFFICE_ID]),
      );
    });
  });
});
