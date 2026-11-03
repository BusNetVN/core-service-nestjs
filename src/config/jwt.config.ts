import { registerAs } from '@nestjs/config';

const MIN_SECRET_BYTES = 32;
const LIFETIME_UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3_600,
  d: 86_400,
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

function requireSecret(name: string, value: string) {
  if (Buffer.byteLength(value, 'utf8') < MIN_SECRET_BYTES) {
    throw new Error(`${name} must contain at least ${MIN_SECRET_BYTES} bytes.`);
  }
  return value;
}

function resolveLifetime(name: string, fallback: string) {
  const value = (process.env[name] ?? fallback).trim();
  const match = /^(\d+)([smhd])$/i.exec(value);
  const amount = match ? Number(match[1]) : 0;
  if (!match || amount <= 0) {
    throw new Error(`${name} must be a positive duration such as 15m or 1d.`);
  }
  return {
    value,
    seconds: amount * LIFETIME_UNIT_SECONDS[match[2].toLowerCase()],
  };
}

export default registerAs('jwt', () => {
  const accessTokenSecret = requireSecret(
    'JWT_ACCESS_TOKEN_SECRET',
    requireEnv('JWT_ACCESS_TOKEN_SECRET'),
  );
  const refreshTokenSecret = requireSecret(
    'JWT_REFRESH_TOKEN_SECRET',
    process.env.JWT_REFRESH_TOKEN_SECRET?.trim() || accessTokenSecret,
  );

  return {
    accessTokenSecret,
    refreshTokenSecret,
    issuer: requireEnv('JWT_ISSUER'),
    audience: requireEnv('JWT_AUDIENCE'),
    accessTokenLifetime: resolveLifetime('JWT_ACCESS_TOKEN_LIFETIME', '1d'),
    refreshTokenLifetime: resolveLifetime('JWT_REFRESH_TOKEN_LIFETIME', '7d'),
  };
});
