import { Injectable } from '@nestjs/common';
import { TokenService } from '../../../common/services/token.service.js';
import { UserRepository } from '../../users/repository/user.repository.js';
import { OperatorLoginDto } from '../dto/operator-login.dto.js';
import { toOperatorLoginResponse, toTokenSubject } from '../mappers/auth.mapper.js';
import { AuthSessionRepository } from '../repository/auth-session.repository.js';
import { hashRefreshToken, type ClientInfo } from '../utils/session-token.js';
import { assertOperatorAccount } from './assert-operator-account.js';
import { findAccountByCredentials } from './find-account-by-credentials.js';
import { OperatorAccessLoader } from './operator-access.js';

@Injectable()
export class OperatorLoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: AuthSessionRepository,
    private readonly tokens: TokenService,
    private readonly access: OperatorAccessLoader,
  ) {}

  async execute(dto: OperatorLoginDto, client: ClientInfo) {
    const user = await findAccountByCredentials(
      this.users,
      dto.username,
      dto.password,
    );
    assertOperatorAccount(user);
    const access = await this.access.load(user);

    const sessionUuid = crypto.randomUUID();
    const tokens = await this.tokens.issue(
      toTokenSubject(user, access.permissions),
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
