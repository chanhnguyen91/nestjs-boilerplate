import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  @Index('idx_permissions_name')
  name: string;

  @Column({ nullable: true, name: 'description' })
  description: string;

  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermissionEntity[];

  @Column({ type: 'datetime', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}