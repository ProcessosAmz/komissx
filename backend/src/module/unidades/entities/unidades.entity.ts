import { Empresas } from "@/module/empresas/entities/empresas.entity";
import { Cidade, Estado } from "@/module/localidade/entities";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

@Entity("unidades")
@Unique(["empresaId", "name"])
export class Unidades {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ name: "empresa_id", type: "uuid" })
  empresaId: string;

  @Column({ name: "estado_id", type: "uuid", nullable: true })
  estadoId: string | null;

  @Column({ name: "cidade_id", type: "uuid", nullable: true })
  cidadeId: string | null;

  @ManyToOne(() => Empresas, (empresa) => empresa.unidades)
  @JoinColumn({ name: "empresa_id" })
  empresa: Empresas;

  @ManyToOne(() => Estado, { nullable: true })
  @JoinColumn({ name: "estado_id" })
  estado: Estado | null;

  @ManyToOne(() => Cidade, { nullable: true })
  @JoinColumn({ name: "cidade_id" })
  cidade: Cidade | null;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
