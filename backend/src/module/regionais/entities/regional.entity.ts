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
  import { Operadora } from '../../operadoras/entities/operadora.entity';
  import { Estado, Cidade } from '@/module/localidade/entities';
  
  @Entity('regionais')
  @Unique(['operadoraId', 'name'])
  export class Regional {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ name: 'operadora_id' })
    operadoraId: number;
  
    @Column({ name: 'estado_id', nullable: true })
    estadoId: number | null;
  
    @Column({ name: 'cidade_id', nullable: true })
    cidadeId: number | null;
  
    @ManyToOne(() => Operadora, (operadora) => operadora.regionais)
    @JoinColumn({ name: 'operadora_id' })
    operadora: Operadora;
  
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