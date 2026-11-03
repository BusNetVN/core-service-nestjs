import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AuthSession } from '../entities/auth-session.entity.js';
import type { SessionRevokeReasonValue } from '../enums/session-revoke-reason.enum.js';

@Injectable()
export class AuthSessionRepository {
  constructor(
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
  ) {}

  create(data: Partial<AuthSession>) {
    return this.sessions.save(this.sessions.create(data));
  }

  findByUuid(uuid: string) {
    return this.sessions.findOne({
      where: { uuid },
      relations: { user: { company: true } },
    });
  }

  /**
   * Swaps the stored refresh token hash only if it still equals `currentHash`,
   * so a refresh token can be exchanged at most once even under concurrent requests.
   */
  async rotate(
    session: AuthSession,
    currentHash: string,
    nextHash: string,
    expiresAt: Date,
  ) {
    const result = await this.sessions
      .createQueryBuilder()
      .update(AuthSession)
      .set({
        refresh_token_hash: nextHash,
        expires_at: expiresAt,
        refreshed_at: () => 'NOW()',
        refresh_count: () => 'refresh_count + 1',
      })
      .where('id = :id', { id: session.id })
      .andWhere('refresh_token_hash = :currentHash', { currentHash })
      .andWhere('revoked_at IS NULL')
      .execute();
    return (result.affected ?? 0) > 0;
  }

  async revoke(session: AuthSession, reason: SessionRevokeReasonValue) {
    await this.sessions.update(
      { id: session.id, revoked_at: IsNull() },
      { revoked_at: new Date(), revoked_reason: reason },
    );
  }
}
