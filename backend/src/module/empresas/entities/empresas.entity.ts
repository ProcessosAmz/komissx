import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Unidades } from '@/module/unidades/entities/unidades.entity';
import { Users } from '@/module/users/entities/users.entity';


@Entity('empresas')
export class Empresas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Unidades, (unidade) => unidade.empresa)
  unidades: Unidades[];

  @OneToMany(() => Users, (user) => user.empresa)
  users: Users[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}