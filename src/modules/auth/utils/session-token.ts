import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

const USER_AGENT_MAX_LENGTH = 500;

export function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function sameHash(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type ClientInfo = {
  ip_address: string;
  user_agent: string;
};

/** Requests only arrive through nginx, which overwrites X-Real-IP with the real client address. */
export function clientInfo(request: Request): ClientInfo {
  return {
    ip_address: (request.get('x-real-ip') ?? request.ip ?? '').slice(0, 64),
    user_agent: (request.get('user-agent') ?? '').slice(0, USER_AGENT_MAX_LENGTH),
  };
}
