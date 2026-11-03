import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorMessage } from '../constants/error-message.constant.js';
import type { AccessTokenPayload } from '../types/access-token-payload.js';
import { parsePermissionCodes } from '../utils/permission-code.js';

type TokenLifetime = {
  value: string;
  seconds: number;
};

export type JwtConfig = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  issuer: string;
  audience: string;
  accessTokenLifetime: TokenLifetime;
  refreshTokenLifetime: TokenLifetime;
};

export type TokenSubject = {
  uuid: string;
  username: string | null;
  account_type: string;
  staff_role: string | null;
  company_uuid: string | null;
  /** Permission codes granted through the account's roles; copied into the access token only. */
  permissions?: string[];
};

export type IssuedTokens = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: string;
};

export type RefreshTokenPayload = {
  sub: string;
  sid: string;
};

type TokenType = 'access' | 'refresh';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  jwtConfig() {
    return this.config.getOrThrow<JwtConfig>('jwt');
  }

  /** The refresh token carries the session uuid (sid) of its tbl_auth_sessions row. */
  async issue(subject: TokenSubject, sessionUuid: string): Promise<IssuedTokens> {
    const config = this.jwtConfig();
    const [accessToken, refreshToken] = await Promise.all([
      this.sign(
        subject,
        'access',
        config.accessTokenSecret,
        config.accessTokenLifetime,
        subject.permissions?.length ? { permissions: subject.permissions } : {},
      ),
      this.sign(subject, 'refresh', config.refreshTokenSecret, config.refreshTokenLifetime, {
        sid: sessionUuid,
        // Makes every refresh token unique even when issued within the same second.
        jti: crypto.randomUUID(),
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: config.accessTokenLifetime.value,
    };
  }

  refreshTokenExpiresAt(from = new Date()) {
    return new Date(from.getTime() + this.jwtConfig().refreshTokenLifetime.seconds * 1000);
  }

  async verifyRefresh(
    token: string,
    options: { ignoreExpiration?: boolean } = {},
  ): Promise<RefreshTokenPayload> {
    const config = this.jwtConfig();
    try {
      const payload = await this.jwt.verifyAsync<{
        sub?: string;
        sid?: string;
        type?: string;
      }>(token, {
        secret: config.refreshTokenSecret,
        algorithms: ['HS256'],
        issuer: config.issuer,
        audience: config.audience,
        ignoreExpiration: options.ignoreExpiration ?? false,
      });
      if (payload.type !== 'refresh' || !payload.sub || !payload.sid) {
        throw new UnauthorizedException(ErrorMessage.INVALID_REFRESH_TOKEN);
      }
      return { sub: payload.sub, sid: payload.sid };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(ErrorMessage.INVALID_REFRESH_TOKEN);
    }
  }

  async verifyAccess(token: string): Promise<AccessTokenPayload> {
    const config = this.jwtConfig();
    try {
      const payload = await this.jwt.verifyAsync<{
        sub?: string;
        username?: string;
        account_type?: string;
        staff_role?: string | null;
        company_uuid?: string | null;
        permissions?: unknown;
        type?: string;
      }>(token, {
        secret: config.accessTokenSecret,
        algorithms: ['HS256'],
        issuer: config.issuer,
        audience: config.audience,
      });
      if (payload.type !== 'access' || !payload.sub) {
        throw new UnauthorizedException(ErrorMessage.INVALID_ACCESS_TOKEN);
      }
      return {
        sub: payload.sub,
        username: payload.username ?? '',
        account_type: payload.account_type ?? '',
        staff_role: payload.staff_role ?? null,
        company_uuid: payload.company_uuid ?? null,
        permissions: parsePermissionCodes(payload.permissions),
        type: 'access',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(ErrorMessage.INVALID_ACCESS_TOKEN);
    }
  }

  private sign(
    subject: TokenSubject,
    type: TokenType,
    secret: string,
    lifetime: TokenLifetime,
    extraClaims: Record<string, string | string[]> = {},
  ) {
    const config = this.jwtConfig();
    return this.jwt.signAsync(
      {
        ...extraClaims,
        account_type: subject.account_type,
        type,
        ...(subject.username ? { username: subject.username } : {}),
        ...(subject.staff_role ? { staff_role: subject.staff_role } : {}),
        ...(subject.company_uuid ? { company_uuid: subject.company_uuid } : {}),
      },
      {
        secret,
        algorithm: 'HS256',
        issuer: config.issuer,
        audience: [config.audience],
        subject: subject.uuid,
        expiresIn: lifetime.seconds,
        notBefore: 0,
      },
    );
  }
}
