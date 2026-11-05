import { Injectable } from '@nestjs/common';
import { AdminPermissionRepository } from '../../repository/admin/admin-permission.repository.js';

@Injectable()
export class AdminDeletePermissionUseCase {
  constructor(private readonly permissions: AdminPermissionRepository) {}

  async execute(uuid: string) {
    const permission = await this.permissions.findByUuid(uuid);
    await this.permissions.remove(permission);
    return {
      id: permission.uuid,
      code: permission.code,
      name: permission.name,
    };
  }
}
