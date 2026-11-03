import { Injectable } from '@nestjs/common';
import { TokenService } from '../../../common/services/token.service.js';
import { UserRepository } from '../../users/repository/user.repository.js';
import { AdminLoginDto } from '../dto/admin-login.dto.js';
import { toLoginResponse, toTokenSubject } from '../mappers/auth.mapper.js';
import { AuthSessionRepository } from '../repository/auth-session.repository.js';
import { hashRefreshToken, type ClientInfo } from '../utils/session-token.js';
import { assertAdminAccount } from './assert-admin-account.js';
import { findAccountByCredentials } from './find-account-by-credentials.js';

@Injectable()
export class AdminLoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: AuthSessionRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(dto: AdminLoginDto, client: ClientInfo) {
    const user = await findAccountByCredentials(
      this.users,
      dto.username,
      dto.password,
    );
    assertAdminAccount(user);

    const sessionUuid = crypto.randomUUID();
    const tokens = await this.tokens.issue(toTokenSubject(user), sessionUuid);
    await this.sessions.create({
      uuid: sessionUuid,
      user_id: user.id,
      refresh_token_hash: hashRefreshToken(tokens.refresh_token),
      ...client,
      expires_at: this.tokens.refreshTokenExpiresAt(),
    });
    return toLoginResponse(user, tokens);
  }
}
