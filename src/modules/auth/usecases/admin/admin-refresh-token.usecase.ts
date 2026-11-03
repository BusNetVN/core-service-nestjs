import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { TokenService } from '../../../../common/services/token.service.js';
import { AdminRefreshTokenDto } from '../../dto/admin/admin-refresh-token.dto.js';
import { SessionRevokeReason } from '../../enums/session-revoke-reason.enum.js';
import {
  toAdminLoginResponse,
  toAdminTokenSubject,
} from '../../mappers/admin/admin-auth.mapper.js';
import { AdminAuthSessionRepository } from '../../repository/admin/admin-auth-session.repository.js';
import {
  hashRefreshToken,
  sameHash,
} from '../../utils/admin/admin-session-token.js';
import { assertAdminAccount } from './admin-assert-account.js';

/** Exchanges a refresh token for new tokens of the same session; each refresh token works once. */
@Injectable()
export class AdminRefreshTokenUseCase {
  constructor(
    private readonly sessions: AdminAuthSessionRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(dto: AdminRefreshTokenDto) {
    const payload = await this.tokens.verifyRefresh(dto.refresh_token);
    const session = await this.sessions.findByUuid(payload.sid);
    if (
      !session ||
      session.user.uuid !== payload.sub ||
      session.revoked_at ||
      session.expires_at.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException(ErrorMessage.INVALID_REFRESH_TOKEN);
    }

    // A valid signature with an outdated hash means an already-rotated token was replayed.
    const presentedHash = hashRefreshToken(dto.refresh_token);
    if (!sameHash(presentedHash, session.refresh_token_hash)) {
      await this.sessions.revoke(session, SessionRevokeReason.TOKEN_REUSED);
      throw new UnauthorizedException(ErrorMessage.INVALID_REFRESH_TOKEN);
    }

    const user = session.user;
    if (user.deleted_at) {
      await this.sessions.revoke(session, SessionRevokeReason.USER_INACTIVE);
      throw new UnauthorizedException(ErrorMessage.INVALID_REFRESH_TOKEN);
    }
    try {
      assertAdminAccount(user);
    } catch (error) {
      await this.sessions.revoke(session, SessionRevokeReason.USER_INACTIVE);
      throw error;
    }

    const tokens = await this.tokens.issue(
      toAdminTokenSubject(user),
      session.uuid,
    );
    const rotated = await this.sessions.rotate(
      session,
      presentedHash,
      hashRefreshToken(tokens.refresh_token),
      this.tokens.refreshTokenExpiresAt(),
    );
    if (!rotated) {
      await this.sessions.revoke(session, SessionRevokeReason.TOKEN_REUSED);
      throw new UnauthorizedException(ErrorMessage.INVALID_REFRESH_TOKEN);
    }
    return toAdminLoginResponse(user, tokens);
  }
}
