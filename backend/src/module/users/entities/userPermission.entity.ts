// import {
//     Entity,
//     JoinColumn,
//     ManyToOne,
//     PrimaryGeneratedColumn,
//   } from 'typeorm';
//   import { User } from './user.entity';
//   import { Permission } from '../../permissions/entities/permission.entity';
  
//   @Entity('user_permissions')
//   export class UserPermission {
//     @PrimaryGeneratedColumn()
//     id: number;
  
//     @ManyToOne(() => User, user => user.permissions, {
//       onDelete: 'CASCADE',
//     })
//     @JoinColumn({ name: 'user_id' })
//     user: User;
  
//     @ManyToOne(() => Permission, permission => permission.users, {
//       onDelete: 'CASCADE',
//     })
//     @JoinColumn({ name: 'permission_id' })
//     permission: Permission;
//   }