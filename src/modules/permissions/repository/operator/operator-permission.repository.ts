import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity.js';

/** Permission lookups for company-scoped modules (/api/operator/roles). */
@Injectable()
export class OperatorPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissions: Repository<Permission>,
  ) {}

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
}
