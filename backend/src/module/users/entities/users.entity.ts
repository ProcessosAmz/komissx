import { Empresas } from "@/module/empresas/entities/empresas.entity";
import { Role } from "@/module/roles/entities/role.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserPermission } from "./userPermission.entity";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: "hubsoft_id", type: "int", unique: true, nullable: true })
  hubsoftId: number | null;

  @Column({ name: "role_id", type: "uuid" })
  roleId: string;

  @Column({ name: "empresa_id", type: "uuid" })
  empresaId: string;

  @Column({ name: "supervisor_id", type: "uuid", nullable: true })
  supervisorId: string | null;

  @ManyToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn({ name: "role_id" })
  role: Role;

  @ManyToOne(() => Empresas, (empresa) => empresa.users, { nullable: false })
  @JoinColumn({ name: "empresa_id" })
  empresa: Empresas;

  @ManyToOne(() => Users, (user) => user.liderados, { nullable: true })
  @JoinColumn({ name: "supervisor_id" })
  supervisor: Users | null;

  @OneToMany(() => Users, (user) => user.supervisor)
  liderados: Users[];

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  userPermissions: UserPermission[];

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
