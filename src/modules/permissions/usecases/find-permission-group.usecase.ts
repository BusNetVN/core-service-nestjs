import { Injectable } from '@nestjs/common';
import { toPublicPermissionGroup } from '../mappers/permission.mapper.js';
import { PermissionGroupRepository } from '../repository/permission-group.repository.js';

@Injectable()
export class FindPermissionGroupUseCase {
  constructor(private readonly groups: PermissionGroupRepository) {}

  async execute(uuid: string) {
    return toPublicPermissionGroup(await this.groups.findByUuid(uuid));
  }
}
