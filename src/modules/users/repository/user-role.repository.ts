import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { Role } from '../../roles/entities/role.entity.js';
import { UserRole } from '../entities/user-role.entity.js';

@Injectable()
export class UserRoleRepository {
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

  /** Codes of the active permissions granted by the account's active roles, sorted. */
  async findPermissionCodes(userId: string) {
    const rows = await this.userRoles
      .createQueryBuilder('userRole')
      .innerJoin('userRole.role', 'role', 'role.is_active = true')
      .innerJoin('role.permissions', 'permission', 'permission.is_active = true')
      .where('userRole.user_id = :userId', { userId })
      .select('DISTINCT permission.code', 'code')
      .getRawMany<{ code: string }>();
    return rows.map((row) => row.code).sort();
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
