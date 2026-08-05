import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'hubsoft_id', type: 'int', unique: true, nullable: true })
  hubsoftId: number | null;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'operadora_id', type: 'uuid' })
  operadoraId: string;

  @Column({ name: 'regional_id', type: 'uuid' })
  regionalId: string;

  @Column({ name: 'supervisor_id', type: 'uuid', nullable: true })
  supervisorId: string | null;

  @Column({ name: 'participa_fechamento', default: false })
  participaFechamento: boolean;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}