import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository.js';
import type { UserActor } from '../user-actor.js';

/**
 * Soft delete: the row is kept (username stays reserved) and the account is locked so it
 * can no longer log in. It changes the record, so the actor is recorded as updated_by.
 */
@Injectable()
export class AdminDeleteUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(uuid: string, actor: UserActor) {
    const user = await this.users.findActiveByUuid(uuid);
    if (user.uuid === actor.uuid) {
      throw new BadRequestException('Không thể xóa tài khoản đang đăng nhập.');
    }

    const now = new Date();
    user.deleted_at = now;
    user.status = false;
    user.updated_by = actor.username || null;
    user.updated_at = now;
    await this.users.save(user);

    return {
      id: user.uuid,
      username: user.username ?? '',
    };
  }
}
