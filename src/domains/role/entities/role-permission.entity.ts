import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';

@Entity('role_permissions')
export class RolePermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: 0, name: 'can_delete' })
  canDelete: boolean;

  @Column({ type: 'boolean', default: 0, name: 'can_read' })
  canRead: boolean;

  @Column({ type: 'boolean', default: 0, name: 'can_write' })
  canWrite: boolean;

  @Column({ type: 'datetime', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => PermissionEntity, (permission) => permission.rolePermissions)
  @JoinColumn({ name: 'permission_id' })
  @Index('idx_role_permissions_permission_id')
  permission: PermissionEntity;

  @ManyToOne(() => RoleEntity, (role) => role.rolePermissions)
  @JoinColumn({ name: 'role_id' })
  @Index('idx_role_permissions_role_id')
  role: RoleEntity;
}