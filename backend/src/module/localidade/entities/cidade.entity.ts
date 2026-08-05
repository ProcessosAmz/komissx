import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estado } from './estado.entity';

@Entity('cidades')
export class Cidade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'estado_id', type: 'uuid' })
  estadoId: string;

  @ManyToOne(() => Estado, (estado) => estado.cidades)
  @JoinColumn({ name: 'estado_id' })
  estado: Estado;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}