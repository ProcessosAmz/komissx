import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'hubsoft_id', type: 'int', unique: true, nullable: true })
  hubsoftId: number | null;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'operadora_id' })
  operadoraId: number;

  @Column({ name: 'regional_id' })
  regionalId: number;

  @Column({ name: 'supervisor_id', type: 'int', nullable: true })
  supervisorId: number | null;

  @Column({ name: 'participa_fechamento', default: false })
  participaFechamento: boolean;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}