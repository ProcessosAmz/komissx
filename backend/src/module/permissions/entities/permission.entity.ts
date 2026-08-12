import { RolePermission } from "@/module/roles/entities/rolePermission.entity";
import { UserPermission } from "@/module/users/entities/userPermission.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];

  @OneToMany(
    () => UserPermission,
    (userPermission) => userPermission.permission,
  )
  userPermissions: UserPermission[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
