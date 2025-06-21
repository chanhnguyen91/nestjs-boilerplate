import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, Index } from 'typeorm';
import { RoleEntity } from '../../role/entities/role.entity';
import { RefreshTokenEntity } from '../../auth/entities/refresh-token.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'email' })
  @Index('idx_users_email')
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ nullable: true, name: 'name' })
  name: string;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified: boolean;

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  refreshTokens: RefreshTokenEntity[];

  @Column({ type: 'datetime', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}