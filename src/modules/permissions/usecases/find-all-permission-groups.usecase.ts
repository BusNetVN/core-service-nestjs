import { Injectable } from '@nestjs/common';
import { toPublicPermissionGroup } from '../mappers/permission.mapper.js';
import { PermissionGroupRepository } from '../repository/permission-group.repository.js';

@Injectable()
export class FindAllPermissionGroupsUseCase {
  constructor(private readonly groups: PermissionGroupRepository) {}

  async execute(query?: string) {
    const groups = await this.groups.findAll(query);
    return groups.map(toPublicPermissionGroup);
  }
}
