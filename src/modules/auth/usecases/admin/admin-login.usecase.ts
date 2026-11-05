import { Injectable } from '@nestjs/common';
import { TokenService } from '../../../../common/services/token.service.js';
import { AdminUserRepository } from '../../../users/repository/admin/admin-user.repository.js';
import { AdminLoginDto } from '../../dto/admin/admin-login.dto.js';
import {
  toAdminLoginResponse,
  toAdminTokenSubject,
} from '../../mappers/admin/admin-auth.mapper.js';
import { AdminAuthSessionRepository } from '../../repository/admin/admin-auth-session.repository.js';
import {
  hashRefreshToken,
  type ClientInfo,
} from '../../utils/admin/admin-session-token.js';
import { assertAdminAccount } from './admin-assert-account.js';
import { findAdminAccountByCredentials } from './admin-find-account-by-credentials.js';

@Injectable()
export class AdminLoginUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly sessions: AdminAuthSessionRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(dto: AdminLoginDto, client: ClientInfo) {
    const user = await findAdminAccountByCredentials(
      this.users,
      dto.username,
      dto.password,
    );
    assertAdminAccount(user);

    const sessionUuid = crypto.randomUUID();
    const tokens = await this.tokens.issue(
      toAdminTokenSubject(user),
      sessionUuid,
    );
    await this.sessions.create({
      uuid: sessionUuid,
      user_id: user.id,
      refresh_token_hash: hashRefreshToken(tokens.refresh_token),
      ...client,
      expires_at: this.tokens.refreshTokenExpiresAt(),
    });
    return toAdminLoginResponse(user, tokens);
  }
}
