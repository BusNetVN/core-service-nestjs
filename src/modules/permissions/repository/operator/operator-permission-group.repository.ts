import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionGroup } from '../../entities/permission-group.entity.js';

/** Permission group data access for /api/operator/permission-groups (read only). */
@Injectable()
export class OperatorPermissionGroupRepository {
  constructor(
    @InjectRepository(PermissionGroup)
    private readonly groups: Repository<PermissionGroup>,
  ) {}

  /**
   * Active groups with only their active permissions; groups left without any active
   * permission are dropped by the inner join.
   */
  findAllActive() {
    return this.groups
      .createQueryBuilder('permissionGroup')
      .innerJoinAndSelect(
        'permissionGroup.permissions',
        'permission',
        'permission.is_active = true',
      )
      .where('permissionGroup.is_active = true')
      .orderBy('permissionGroup.sort_order', 'ASC')
      .addOrderBy('permissionGroup.name', 'ASC')
      .getMany();
  }
}
