import { Permission } from "@/module/permissions/entities/permission.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users.entity";

export enum PermissionOverrideType {
  GRANT = "GRANT",
  DENY = "DENY",
}

@Entity("user_permissions")
export class UserPermission {
  @PrimaryColumn({ name: "user_id", type: "uuid" })
  userId: string;

  @PrimaryColumn({ name: "permission_id", type: "int" })
  permissionId: number;

  @Column({
    name: "type",
    type: "enum",
    enum: PermissionOverrideType,
  })
  type: PermissionOverrideType;

  @ManyToOne(() => Users, (user) => user.userPermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Permission, (permission) => permission.userPermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "permission_id" })
  permission: Permission;
}
