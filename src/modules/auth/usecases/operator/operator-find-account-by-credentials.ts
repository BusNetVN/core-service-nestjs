import { UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { normalizeUsername } from '../../../users/mappers/operator/operator-user.mapper.js';
import { OperatorUserRepository } from '../../../users/repository/operator/operator-user.repository.js';

/** The same message for an unknown username and a wrong password, so accounts cannot be probed. */
export async function findOperatorAccountByCredentials(
  users: OperatorUserRepository,
  username: string,
  password: string,
) {
  const user = await users.findByUsername(normalizeUsername(username));
  const valid =
    !!user &&
    !user.deleted_at &&
    !!user.password_hash &&
    (await compare(password, user.password_hash));
  if (!user || !valid) {
    throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng.');
  }
  return user;
}
