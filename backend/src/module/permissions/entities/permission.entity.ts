// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   OneToMany,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { RolePermission } from '../../role_permissions/entities/role_permission.entity';
// import { UserPermission } from '../../user_permissions/entities/user_permission.entity';

// @Entity('permissions')
// export class Permission {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ unique: true })
//   name: string;

//   @Column()
//   description: string;

//   @OneToMany(() => RolePermission, rp => rp.permission)
//   roles: RolePermission[];

//   @OneToMany(() => UserPermission, up => up.permission)
//   users: UserPermission[];

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }