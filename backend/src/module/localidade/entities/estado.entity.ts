import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Pais } from './pais.entity';
  import { Cidade } from './cidade.entity';
  
  @Entity('estados')
  export class Estado {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ length: 2 })
    uf: string;
  
    @Column({ name: 'pais_id' })
    paisId: number;
  
    @ManyToOne(() => Pais, (pais) => pais.estados)
    @JoinColumn({ name: 'pais_id' })
    pais: Pais;
  
    @OneToMany(() => Cidade, (cidade) => cidade.estado)
    cidades: Cidade[];
  
    @Column({ default: true })
    active: boolean;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }