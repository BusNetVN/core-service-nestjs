import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { TokenService } from '../../../common/services/token.service.js';
import { UserRoleRepository } from '../../users/repository/user-role.repository.js';
import { UserRepository } from '../../users/repository/user.repository.js';
import { SessionRevokeReason } from '../enums/session-revoke-reason.enum.js';
import { AuthSessionRepository } from '../repository/auth-session.repository.js';
import { hashRefreshToken } from '../utils/session-token.js';
import { OperatorAccessLoader } from './operator-access.js';
import { OperatorLoginUseCase } from './operator-login.usecase.js';
import { OperatorRefreshTokenUseCase } from './operator-refresh-token.usecase.js';
import { RefreshTokenUseCase } from './refresh-token.usecase.js';

const PASSWORD = 'Passw0rd!';
const CLIENT = { ip_address: '127.0.0.1', user_agent: 'vitest' };
const ISSUED = {
  access_token: 'access',
  refresh_token: 'refresh-2',
  token_type: 'Bearer' as const,
  expires_in: '1d',
};

async function staffAccount(overrides: Record<string, unknown> = {}) {
  return {
    id: '7',
    uuid: '2f1c6c1e-6a52-4a0e-9c55-6b2f7f0a8b11',
    username: 'nv01.futa',
    password_hash: await hash(PASSWORD, 4),
    account_type: 'COMPANY_STAFF',
    staff_role: 'STAFF',
    status: true,
    is_active: true,
    deleted_at: null,
    full_name: 'Nhân viên 01',
    email: '',
    phone_number: '',
    created_by: null,
    updated_by: null,
    created_at: new Date(),
    updated_at: new Date(),
    company: { id: '3', uuid: '8d6f0f2e-3b1a-4c7e-9f00-1a2b3c4d5e6f', is_active: true },
    ...overrides,
  };
}

describe('Operator auth usecases', () => {
  const users = { findByUsername: vi.fn() };
  const sessions = {
    create: vi.fn(),
    findByUuid: vi.fn(),
    rotate: vi.fn(),
    revoke: vi.fn(),
  };
  const tokens = {
    issue: vi.fn(async () => ISSUED),
    refreshTokenExpiresAt: vi.fn(() => new Date(Date.now() + 60_000)),
    verifyRefresh: vi.fn(),
  };
  const userRoles = {
    findRoles: vi.fn(async () => [
      { id: '11', uuid: 'a3b9c2d1-0e4f-4a5b-8c6d-7e8f9a0b1c2d', name: 'Điều hành' },
    ]),
    findPermissionCodes: vi.fn(async () => ['ROUTE_UPDATE']),
  };

  let login: OperatorLoginUseCase;
  let refresh: OperatorRefreshTokenUseCase;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OperatorLoginUseCase,
        OperatorRefreshTokenUseCase,
        RefreshTokenUseCase,
        OperatorAccessLoader,
        { provide: UserRepository, useValue: users },
        { provide: AuthSessionRepository, useValue: sessions },
        { provide: TokenService, useValue: tokens },
        { provide: UserRoleRepository, useValue: userRoles },
      ],
    }).compile();

    login = module.get(OperatorLoginUseCase);
    refresh = module.get(OperatorRefreshTokenUseCase);
  });

  it('logs a company staff account in with the permissions of its roles', async () => {
    users.findByUsername.mockResolvedValue(await staffAccount());

    const result = await login.execute(
      { username: ' NV01.FUTA ', password: PASSWORD },
      CLIENT,
    );

    expect(users.findByUsername).toHaveBeenCalledWith('nv01.futa');
    expect(tokens.issue).toHaveBeenCalledWith(
      expect.objectContaining({
        account_type: 'COMPANY_STAFF',
        company_uuid: '8d6f0f2e-3b1a-4c7e-9f00-1a2b3c4d5e6f',
        permissions: ['ROUTE_UPDATE'],
      }),
      expect.any(String),
    );
    expect(sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: '7',
        refresh_token_hash: hashRefreshToken(ISSUED.refresh_token),
        ip_address: CLIENT.ip_address,
      }),
    );
    expect(result.access_token).toBe('access');
    expect(result.account.roles).toEqual([
      { id: 'a3b9c2d1-0e4f-4a5b-8c6d-7e8f9a0b1c2d', name: 'Điều hành' },
    ]);
    // Role permissions plus the STAFF defaults, normalized.
    expect(result.account.permissions).toContain('ROUTE_UPDATE');
    expect(result.account.permissions).toContain('OFFICE_LIST');
    expect(result.account.permissions).not.toContain('OFFICE_CREATE');
  });

  it('rejects a wrong password with the generic credentials message', async () => {
    users.findByUsername.mockResolvedValue(await staffAccount());

    await expect(
      login.execute({ username: 'nv01.futa', password: 'wrong' }, CLIENT),
    ).rejects.toThrow(UnauthorizedException);
    expect(sessions.create).not.toHaveBeenCalled();
  });

  it.each([
    ['a system admin', { account_type: 'SYSTEM_ADMIN', company: null }],
    ['a locked account', { status: false }],
    ['an account without company', { company: null }],
    ['an account of an inactive company', { company: { id: '3', uuid: 'x', is_active: false } }],
  ])('refuses %s', async (_, overrides) => {
    users.findByUsername.mockResolvedValue(await staffAccount(overrides));

    await expect(
      login.execute({ username: 'nv01.futa', password: PASSWORD }, CLIENT),
    ).rejects.toThrow(ForbiddenException);
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it('refreshes with permissions re-read from the roles', async () => {
    const user = await staffAccount({ staff_role: 'ADMIN' });
    tokens.verifyRefresh.mockResolvedValue({ sub: user.uuid, sid: 'session-1' });
    sessions.findByUuid.mockResolvedValue({
      uuid: 'session-1',
      user,
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
      refresh_token_hash: hashRefreshToken('refresh-1'),
    });
    sessions.rotate.mockResolvedValue(true);
    userRoles.findPermissionCodes.mockResolvedValueOnce(['TICKET_SELL']);

    const result = await refresh.execute({ refresh_token: 'refresh-1' });

    expect(tokens.issue).toHaveBeenCalledWith(
      expect.objectContaining({ permissions: ['TICKET_SELL'] }),
      'session-1',
    );
    expect(result.refresh_token).toBe('refresh-2');
    expect(result.account.permissions).toContain('TICKET_SELL');
    expect(result.account.permissions).toContain('OFFICE_CREATE');
  });

  it('revokes the session when the account may no longer use the operator app', async () => {
    const user = await staffAccount({ status: false });
    tokens.verifyRefresh.mockResolvedValue({ sub: user.uuid, sid: 'session-1' });
    const session = {
      uuid: 'session-1',
      user,
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
      refresh_token_hash: hashRefreshToken('refresh-1'),
    };
    sessions.findByUuid.mockResolvedValue(session);

    await expect(refresh.execute({ refresh_token: 'refresh-1' })).rejects.toThrow(
      ForbiddenException,
    );
    expect(sessions.revoke).toHaveBeenCalledWith(
      session,
      SessionRevokeReason.USER_INACTIVE,
    );
    expect(tokens.issue).not.toHaveBeenCalled();
  });
});
