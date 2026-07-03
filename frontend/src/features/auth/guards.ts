import type { Role } from "@/engine/types";

export type Permission =
    | "dashboard:view"
    | "rules:manage"
    | "teams:manage"
    | "goals:manage"
    | "closings:import"
    | "closings:approve"
    | "audit:view"
    | "settings:manage";

const MATRIX: Record<Role, Permission[]> = {
    ADMIN: [
        "dashboard:view", "rules:manage", "teams:manage", "goals:manage",
        "closings:import", "closings:approve", "audit:view", "settings:manage",
    ],
    OPERADOR: ["dashboard:view", "closings:import"],
};

export function can(role: Role | undefined, perm: Permission): boolean {
    if (!role) return false;
    return MATRIX[role]?.includes(perm) ?? false;
}
