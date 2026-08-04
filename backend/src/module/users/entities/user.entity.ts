import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => UserRole, userRole => userRole.user)
  roles: UserRole[];

  @OneToMany(() => UserPermission, permission => permission.user)
  permissions: UserPermission[];

  @Column({ name: 'hubsoft_id', unique: true, nullable: true })
  hubsoftId: number; // Armazena o ID vindo da API externa

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}