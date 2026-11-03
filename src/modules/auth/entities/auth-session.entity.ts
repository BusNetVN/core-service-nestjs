import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import type { SessionRevokeReasonValue } from '../enums/session-revoke-reason.enum.js';

/** One row per successful login: the login history and the refresh token currently valid for it. */
@Entity('tbl_auth_sessions')
export class AuthSession {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  uuid: string;

  @Index()
  @Column({ type: 'bigint' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_auth_sessions_user',
  })
  user: User;

  /** SHA-256 (hex) of the latest refresh token; the token itself is never stored. */
  @Column({ type: 'varchar', length: 64 })
  refresh_token_hash: string;

  @Column({ type: 'varchar', length: 64, default: '' })
  ip_address: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  user_agent: string;

  /** Login time. */
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  refreshed_at: Date | null;

  @Column({ type: 'int', default: 0 })
  refresh_count: number;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at: Date | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  revoked_reason: SessionRevokeReasonValue | null;
}
