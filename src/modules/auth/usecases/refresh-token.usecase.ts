import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorMessage } from '../../../common/constants/error-message.constant.js';
import {
  TokenService,
  type TokenSubject,
} from '../../../common/services/token.service.js';
import type { User } from '../../users/entities/user.entity.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { SessionRevokeReason } from '../enums/session-revoke-reason.enum.js';
import { toLoginResponse, toTokenSubject } from '../mappers/auth.mapper.js';
import { AuthSessionRepository } from '../repository/auth-session.repository.js';
import { hashRefreshToken, sameHash } from '../utils/session-token.js';
import { assertAdminAccount } from './assert-admin-account.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly sessions: AuthSessionRepository,
    private readonly tokens: TokenService,
  ) {}

  /** Refresh for bnv-admin. */
  async execute(dto: RefreshTokenDto) {
    const { user, tokens } = await this.rotate(dto, assertAdminAccount, (account) =>
      toTokenSubject(account),
    );
    return toLoginResponse(user, tokens);
  }

  /**
   * Exchanges a refresh token for new tokens of the same session. `assertAccount` throws when
   * the account may not use the calling app any more; the session is then revoked.
   */
  async rotate(
    dto: RefreshTokenDto,
    assertAccount: (user: User) => void,
    subjectFor: (user: User) => TokenSubject | Promise<TokenSubject>,
  ) {
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
      assertAccount(user);
    } catch (error) {
      await this.sessions.revoke(session, SessionRevokeReason.USER_INACTIVE);
      throw error;
    }

    const tokens = await this.tokens.issue(await subjectFor(user), session.uuid);
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
    return { user, tokens };
  }
}
