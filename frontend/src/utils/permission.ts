import { MODULE_ROLES } from "@/const/auth";
import type { AuthModule, Role } from "@/types/auth";

export const hasModulePermission = (modulo: AuthModule, role: Role): boolean =>
  MODULE_ROLES[modulo].includes(role);