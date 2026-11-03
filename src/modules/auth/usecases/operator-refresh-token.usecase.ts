import { Injectable } from '@nestjs/common';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { toOperatorLoginResponse, toTokenSubject } from '../mappers/auth.mapper.js';
import { assertOperatorAccount } from './assert-operator-account.js';
import { OperatorAccessLoader, type OperatorAccess } from './operator-access.js';
import { RefreshTokenUseCase } from './refresh-token.usecase.js';

/** Re-reads the account's roles, so permission changes reach the operator on the next refresh. */
@Injectable()
export class OperatorRefreshTokenUseCase {
  constructor(
    private readonly refreshTokens: RefreshTokenUseCase,
    private readonly access: OperatorAccessLoader,
  ) {}

  async execute(dto: RefreshTokenDto) {
    let access: OperatorAccess = { roles: [], permissions: [] };
    const { user, tokens } = await this.refreshTokens.rotate(
      dto,
      assertOperatorAccount,
      async (account) => {
        access = await this.access.load(account);
        return toTokenSubject(account, access.permissions);
      },
    );
    return toOperatorLoginResponse(user, tokens, access);
  }
}
