import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity.js';

/** Permission data access for /api/admin/permissions (and /api/admin/roles via the export). */
@Injectable()
export class AdminPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissions: Repository<Permission>,
  ) {}

  create(data: Partial<Permission>) {
    return this.permissions.create(data);
  }

  save(permission: Permission) {
    return this.permissions.save(permission);
  }

  async remove(permission: Permission) {
    await this.permissions.delete({ id: permission.id });
  }

  async findByUuid(uuid: string) {
    const permission = await this.permissions.findOne({ where: { uuid } });
    if (!permission) {
      throw new NotFoundException('Không tìm thấy chức năng.');
    }
    return permission;
  }

  /** Every uuid must exist; `uuids` is expected to hold no duplicates. */
  async findByUuids(uuids: string[]) {
    if (uuids.length === 0) {
      return [];
    }
    const permissions = await this.permissions.find({
      where: { uuid: In(uuids) },
      relations: { group: true },
    });
    if (permissions.length !== uuids.length) {
      throw new BadRequestException('Chức năng không tồn tại hoặc đã bị xóa.');
    }
    return permissions;
  }

  async assertCodeAvailable(code: string, excludeId?: string) {
    const existed = await this.permissions.exists({
      where: excludeId ? { code, id: Not(excludeId) } : { code },
    });
    if (existed) {
      throw new ConflictException('Mã chức năng đã tồn tại.');
    }
  }

  async assertNameAvailable(groupId: string, name: string, excludeId?: string) {
    const qb = this.permissions
      .createQueryBuilder('permission')
      .where('permission.group_id = :groupId', { groupId })
      .andWhere('LOWER(permission.name) = LOWER(:name)', { name });
    if (excludeId) {
      qb.andWhere('permission.id <> :excludeId', { excludeId });
    }
    if (await qb.getExists()) {
      throw new ConflictException('Tên chức năng đã tồn tại trong nhóm này.');
    }
  }

  async findExistingCodes(codes: string[], exceptGroupId?: string) {
    if (codes.length === 0) {
      return [];
    }
    const rows = await this.permissions.find({
      select: { code: true },
      where: exceptGroupId
        ? { code: In(codes), group_id: Not(exceptGroupId) }
        : { code: In(codes) },
    });
    return rows.map((row) => row.code);
  }

  async nextSortOrder(groupId: string) {
    return (
      ((await this.permissions.maximum('sort_order', { group_id: groupId })) ??
        0) + 1
    );
  }
}
