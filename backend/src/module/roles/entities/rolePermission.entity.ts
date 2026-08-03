import {
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { Role } from './role.entity';
  import { Permission } from '../../permissions/entities/permission.entity';
  
  @Entity('role_permissions')
  export class RolePermission {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Role, role => role.permissions, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'role_id' })
    role: Role;
  
    @ManyToOne(() => Permission, permission => permission.roles, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;
  }