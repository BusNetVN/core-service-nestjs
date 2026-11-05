import { Injectable } from '@nestjs/common';
import { TokenService } from '../../../../common/services/token.service.js';
import { OperatorUserRepository } from '../../../users/repository/operator/operator-user.repository.js';
import { OperatorLoginDto } from '../../dto/operator/operator-login.dto.js';
import {
  toOperatorLoginResponse,
  toOperatorTokenSubject,
} from '../../mappers/operator/operator-auth.mapper.js';
import { OperatorAuthSessionRepository } from '../../repository/operator/operator-auth-session.repository.js';
import {
  hashRefreshToken,
  type ClientInfo,
} from '../../utils/operator/operator-session-token.js';
import { OperatorAccessLoader } from './operator-access.js';
import { assertOperatorAccount } from './operator-assert-account.js';
import { findOperatorAccountByCredentials } from './operator-find-account-by-credentials.js';

@Injectable()
export class OperatorLoginUseCase {
  constructor(
    private readonly users: OperatorUserRepository,
    private readonly sessions: OperatorAuthSessionRepository,
    private readonly tokens: TokenService,
    private readonly access: OperatorAccessLoader,
  ) {}

  async execute(dto: OperatorLoginDto, client: ClientInfo) {
    const user = await findOperatorAccountByCredentials(
      this.users,
      dto.username,
      dto.password,
    );
    assertOperatorAccount(user);
    const access = await this.access.load(user);

    const sessionUuid = crypto.randomUUID();
    const tokens = await this.tokens.issue(
      toOperatorTokenSubject(user, access.permissions),
      sessionUuid,
    );
    await this.sessions.create({
      uuid: sessionUuid,
      user_id: user.id,
      refresh_token_hash: hashRefreshToken(tokens.refresh_token),
      ...client,
      expires_at: this.tokens.refreshTokenExpiresAt(),
    });
    return toOperatorLoginResponse(user, tokens, access);
  }
}
