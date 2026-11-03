import { Injectable } from '@nestjs/common';
import type { Role } from '../../roles/entities/role.entity.js';
import type { User } from '../../users/entities/user.entity.js';
import { UserRoleRepository } from '../../users/repository/user-role.repository.js';

export type OperatorAccess = {
  roles: Role[];
  /** Codes granted by the active roles (not the staff_role defaults). */
  permissions: string[];
};

/** Loaded on every login and refresh, so role changes apply from the next token. */
@Injectable()
export class OperatorAccessLoader {
  constructor(private readonly userRoles: UserRoleRepository) {}

  async load(user: User): Promise<OperatorAccess> {
    const [roles, permissions] = await Promise.all([
      this.userRoles.findRoles(user.id),
      this.userRoles.findPermissionCodes(user.id),
    ]);
    return { roles, permissions };
  }
}
