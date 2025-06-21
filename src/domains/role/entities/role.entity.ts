import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, Index } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'name' })
  @Index('idx_roles_name')
  name: string;

  @ManyToMany(() => UserEntity, (user) => user.roles)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: UserEntity[];

  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermissionEntity[];

  @Column({ type: 'datetime', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}