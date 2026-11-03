import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PermissionGroup } from '../entities/permission-group.entity.js';
import { Permission } from '../entities/permission.entity.js';

type GroupFields = Omit<PermissionGroup, 'id' | 'permissions'>;
type PermissionFields = Omit<Permission, 'id' | 'group' | 'group_id'>;

@Injectable()
export class PermissionGroupRepository {
  constructor(
    @InjectRepository(PermissionGroup)
    private readonly groups: Repository<PermissionGroup>,
  ) {}

  async findAll(query?: string) {
    const keyword = query?.trim();
    const qb = this.groups
      .createQueryBuilder('permissionGroup')
      .leftJoinAndSelect('permissionGroup.permissions', 'permission');

    if (keyword) {
      qb.where(
        `permissionGroup.id IN (
          SELECT g.id FROM tbl_permission_groups g
          LEFT JOIN tbl_permissions p ON p.group_id = g.id
          WHERE LOWER(g.name) LIKE :q OR LOWER(g.code) LIKE :q
             OR LOWER(p.name) LIKE :q OR LOWER(p.code) LIKE :q
        )`,
        { q: `%${keyword.toLowerCase()}%` },
      );
    }

    return qb
      .orderBy('permissionGroup.sort_order', 'ASC')
      .addOrderBy('permissionGroup.name', 'ASC')
      .getMany();
  }

  async findByUuid(uuid: string) {
    const group = await this.groups.findOne({
      where: { uuid },
      relations: { permissions: true },
    });
    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm chức năng.');
    }
    return group;
  }

  async assertCodeAvailable(code: string, excludeId?: string) {
    const existed = await this.groups.exists({
      where: excludeId ? { code, id: Not(excludeId) } : { code },
    });
    if (existed) {
      throw new ConflictException('Mã nhóm chức năng đã tồn tại.');
    }
  }

  async nextSortOrder() {
    return ((await this.groups.maximum('sort_order')) ?? 0) + 1;
  }

  async createWithPermissions(
    fields: GroupFields,
    permissions: PermissionFields[],
  ) {
    await this.groups.manager.transaction(async (manager) => {
      const group = await manager.save(manager.create(PermissionGroup, fields));
      if (permissions.length > 0) {
        await manager.save(
          permissions.map((item) =>
            manager.create(Permission, { ...item, group_id: group.id }),
          ),
        );
      }
    });
    return this.findByUuid(fields.uuid);
  }

  /** Permissions whose code is rewritten to the new group prefix count as updated too. */
  async update(
    group: PermissionGroup,
    fields: Partial<GroupFields>,
    renamedCodes: Array<{ id: string; code: string }>,
    updatedAt: Date,
    actorUsername: string | null,
  ) {
    await this.groups.manager.transaction(async (manager) => {
      await manager.update(PermissionGroup, { id: group.id }, fields);
      for (const item of renamedCodes) {
        await manager.update(
          Permission,
          { id: item.id },
          { code: item.code, updated_at: updatedAt, updated_by: actorUsername },
        );
      }
    });
    return this.findByUuid(group.uuid);
  }

  /** Permissions are removed by the ON DELETE CASCADE foreign key. */
  async remove(group: PermissionGroup) {
    await this.groups.delete({ id: group.id });
  }
}
