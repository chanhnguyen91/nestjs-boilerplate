import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, BeforeUpdate, Index, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, name: 'token' })
  token: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens)
  @JoinColumn({ name: 'user_id' })
  @Index('idx_refresh_tokens_user_id')
  user: UserEntity;

  @Column({ type: 'datetime', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}