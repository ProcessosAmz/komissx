import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Empresa } from '../../operadoras/entities/operadora.entity';
import { Estado, Cidade } from '@/module/localidade/entities';

@Entity('regionais')
@Unique(['empresaId', 'name'])
export class Regional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'estado_id', type: 'uuid', nullable: true })
  estadoId: string | null;

  @Column({ name: 'cidade_id', type: 'uuid', nullable: true })
  cidadeId: string | null;

  @ManyToOne(() => Empresa, (empresa) => empresa.regionais)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @ManyToOne(() => Estado, { nullable: true })
  @JoinColumn({ name: 'estado_id' })
  estado: Estado | null;

  @ManyToOne(() => Cidade, { nullable: true })
  @JoinColumn({ name: 'cidade_id' })
  cidade: Cidade | null;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}