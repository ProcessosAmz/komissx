import { BetterAuthAccount } from "@/module/auth/entities/betterAuthAccount.entity";
import { BetterAuthUser } from "@/module/auth/entities/betterAuthUser.entity";
import { Commission } from "@/module/commissions/entities/commission.entity";
import { Empresas } from "@/module/empresas/entities/empresas.entity";
import { Cidade, Estado, Pais } from "@/module/localidade/entities";
import { Permission } from "@/module/permissions/entities/permission.entity";
import { Role } from "@/module/roles/entities/role.entity";
import { RolePermission } from "@/module/roles/entities/rolePermission.entity";
import { Unidades } from "@/module/unidades/entities/unidades.entity";
import { UserPermission } from "@/module/users/entities/userPermission.entity";
import { UserRole } from "@/module/users/entities/userRole.entity";
import { Users } from "@/module/users/entities/users.entity";
import { postgresPoolConfig } from "@/database/postgresPool.config";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import { CommissionRule } from "@/module/commissions/entities/comissionRule.entity";

config({ path: ".env" });

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    Users,
    Pais,
    Estado,
    Cidade,
    Empresas,
    Unidades,
    Role,
    Permission,
    Commission,
    UserPermission,
    UserRole,
    RolePermission,
    BetterAuthUser,
    BetterAuthAccount,
    CommissionRule,
  ],
  migrations: ["src/migrations/*.ts"],
  extra: postgresPoolConfig,
});
