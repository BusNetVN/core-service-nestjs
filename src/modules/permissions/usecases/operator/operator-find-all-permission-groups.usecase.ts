import { Injectable } from '@nestjs/common';
import { toOperatorPermissionGroup } from '../../mappers/operator/operator-permission.mapper.js';
import { OperatorPermissionGroupRepository } from '../../repository/operator/operator-permission-group.repository.js';

/** Catalog to grant to company roles: active groups with their active permissions only. */
@Injectable()
export class OperatorFindAllPermissionGroupsUseCase {
  constructor(private readonly groups: OperatorPermissionGroupRepository) {}

  async execute() {
    const groups = await this.groups.findAllActive();
    return groups.map(toOperatorPermissionGroup);
  }
}
