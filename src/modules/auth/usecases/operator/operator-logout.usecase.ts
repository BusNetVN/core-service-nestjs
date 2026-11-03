import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../../../../common/services/token.service.js';
import { OperatorRefreshTokenDto } from '../../dto/operator/operator-refresh-token.dto.js';
import { SessionRevokeReason } from '../../enums/session-revoke-reason.enum.js';
import { OperatorAuthSessionRepository } from '../../repository/operator/operator-auth-session.repository.js';
import {
  hashRefreshToken,
  sameHash,
} from '../../utils/operator/operator-session-token.js';

/** Idempotent: an unknown, expired or already revoked token is simply ignored. */
@Injectable()
export class OperatorLogoutUseCase {
  constructor(
    private readonly sessions: OperatorAuthSessionRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(dto: OperatorRefreshTokenDto) {
    const payload = await this.tokens
      .verifyRefresh(dto.refresh_token, { ignoreExpiration: true })
      .catch((error: unknown) => {
        if (error instanceof UnauthorizedException) {
          return null;
        }
        throw error;
      });
    if (!payload) {
      return;
    }

    const session = await this.sessions.findByUuid(payload.sid);
    if (
      session &&
      session.user.uuid === payload.sub &&
      sameHash(hashRefreshToken(dto.refresh_token), session.refresh_token_hash)
    ) {
      await this.sessions.revoke(session, SessionRevokeReason.LOGOUT);
    }
  }
}
