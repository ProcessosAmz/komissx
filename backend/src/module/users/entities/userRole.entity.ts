// import {
//     Entity,
//     JoinColumn,
//     ManyToOne,
//     PrimaryGeneratedColumn,
//   } from 'typeorm';
//   import { User } from './user.entity';
//   import { Role } from '../../roles/entities/role.entity';
  
//   @Entity('user_roles')
//   export class UserRole {
//     @PrimaryGeneratedColumn()
//     id: number;
  
//     @ManyToOne(() => User, user => user.roles, {
//       onDelete: 'CASCADE',
//     })
//     @JoinColumn({ name: 'user_id' })
//     user: User;
  
//     @ManyToOne(() => Role, role => role.users, {
//       onDelete: 'CASCADE',
//     })
//     @JoinColumn({ name: 'role_id' })
//     role: Role;
//   }