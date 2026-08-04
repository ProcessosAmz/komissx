import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Regional } from '@/module/regionais/entities/regional.entity';
  
  @Entity('operadoras')
  export class Operadora {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    name: string;
  
    @Column({ default: true })
    active: boolean;
  
    @OneToMany(() => Regional, (regional) => regional.operadora)
    regionais: Regional[];
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }