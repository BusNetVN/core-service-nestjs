import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../../../common/services/token.service.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { SessionRevokeReason } from '../enums/session-revoke-reason.enum.js';
import { AuthSessionRepository } from '../repository/auth-session.repository.js';
import { hashRefreshToken, sameHash } from '../utils/session-token.js';

/** Idempotent: an unknown, expired or already revoked token is simply ignored. */
@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly sessions: AuthSessionRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(dto: RefreshTokenDto) {
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
