import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users_db')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({unique: true})
  email: string;

  @Column()
  senha: string;

  @Column({type: 'enum', enum: 
    ['externo', 
    'supervisor', 
    'recepcionista', 
    'interno', 
    'backoffice', 
    'admin', 
    'autonomo',
    'tecnico'
  ], default: 'externo' })
  role: string;

  @CreateDateColumn()
  data_criado?: Date;

  @UpdateDateColumn()
  data_atualizado?: Date;

  
}
