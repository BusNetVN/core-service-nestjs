import { Injectable } from '@nestjs/common';
import { PermissionGroupRepository } from '../repository/permission-group.repository.js';

@Injectable()
export class RemovePermissionGroupUseCase {
  constructor(private readonly groups: PermissionGroupRepository) {}

  async execute(uuid: string) {
    const group = await this.groups.findByUuid(uuid);
    await this.groups.remove(group);
    return {
      id: group.uuid,
      code: group.code,
      name: group.name,
    };
  }
}
