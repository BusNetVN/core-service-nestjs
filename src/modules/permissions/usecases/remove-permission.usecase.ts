import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repository/permission.repository.js';

@Injectable()
export class RemovePermissionUseCase {
  constructor(private readonly permissions: PermissionRepository) {}

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
