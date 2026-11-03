import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { TokenService } from '../../../../common/services/token.service.js';
import { OperatorRefreshTokenDto } from '../../dto/operator/operator-refresh-token.dto.js';
import { SessionRevokeReason } from '../../enums/session-revoke-reason.enum.js';
import {
  toOperatorLoginResponse,
  toOperatorTokenSubject,
} from '../../mappers/operator/operator-auth.mapper.js';
import { OperatorAuthSessionRepository } from '../../repository/operator/operator-auth-session.repository.js';
import {
  hashRefreshToken,
  sameHash,
} from '../../utils/operator/operator-session-token.js';
import { OperatorAccessLoader } from './operator-access.js';
import { assertOperatorAccount } from './operator-assert-account.js';

/**
 * Exchanges a refresh token for new tokens of the same session; each refresh token works once.
 * Roles are read again, so permission changes reach the operator on the next refresh.
 */
@Injectable()
export class OperatorRefreshTokenUseCase {
  constructor(
    private readonly sessions: OperatorAuthSessionRepository,
    private readonly tokens: TokenService,
    private readonly access: OperatorAccessLoader,
  ) {}

  async execute(dto: OperatorRefreshTokenDto) {
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
      assertOperatorAccount(user);
    } catch (error) {
      await this.sessions.revoke(session, SessionRevokeReason.USER_INACTIVE);
      throw error;
    }

    const access = await this.access.load(user);
    const tokens = await this.tokens.issue(
      toOperatorTokenSubject(user, access.permissions),
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
    return toOperatorLoginResponse(user, tokens, access);
  }
}
