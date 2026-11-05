import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { Role } from '../../../roles/entities/role.entity.js';
import { UserRole } from '../../entities/user-role.entity.js';

/** Role assignments (tbl_user_roles) for /api/admin/users. */
@Injectable()
export class AdminUserRoleRepository {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoles: Repository<UserRole>,
  ) {}

  /** Roles of each account, keyed by the account's bigint id. */
  async findRolesByUserIds(userIds: string[]) {
    const rolesByUser = new Map<string, Role[]>();
    if (userIds.length === 0) {
      return rolesByUser;
    }

    const rows = await this.userRoles.find({
      where: { user_id: In(userIds) },
      relations: { role: true },
    });
    for (const row of rows) {
      const roles = rolesByUser.get(row.user_id) ?? [];
      roles.push(row.role);
      rolesByUser.set(row.user_id, roles);
    }
    return rolesByUser;
  }

  async findRoles(userId: string) {
    return (await this.findRolesByUserIds([userId])).get(userId) ?? [];
  }

  async replace(userId: string, roles: Role[]) {
    await this.userRoles.manager.transaction(async (manager) => {
      await manager.delete(UserRole, { user_id: userId });
      if (roles.length > 0) {
        await manager.insert(
          UserRole,
          roles.map((role) => ({ user_id: userId, role_id: role.id })),
        );
      }
    });
  }
}
