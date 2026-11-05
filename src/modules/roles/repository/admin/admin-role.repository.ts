import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../../entities/role.entity.js';

const SEARCH_COLUMNS = ['name', 'description'] as const;
const ROLE_RELATIONS = {
  company: true,
  permissions: { group: true },
} as const;

/** Role data access for /api/admin/roles (and /api/admin/users via the export). */
@Injectable()
export class AdminRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
  ) {}

  create(data: Partial<Role>) {
    return this.roles.create(data);
  }

  save(role: Role) {
    return this.roles.save(role);
  }

  merge(role: Role, fields: Partial<Role>) {
    return this.roles.merge(role, fields);
  }

  remove(role: Role) {
    return this.roles.remove(role);
  }

  async findByUuid(uuid: string) {
    const role = await this.roles.findOne({
      where: { uuid },
      relations: ROLE_RELATIONS,
    });
    if (!role) {
      throw new NotFoundException('Không tìm thấy vai trò.');
    }
    return role;
  }

  /** Every uuid must be a role of the company; `uuids` is expected to hold no duplicates. */
  async findByUuidsInCompany(companyId: string, uuids: string[]) {
    if (uuids.length === 0) {
      return [];
    }
    const roles = await this.roles.find({
      where: { uuid: In(uuids), company_id: companyId },
    });
    if (roles.length !== uuids.length) {
      throw new BadRequestException(
        'Nhóm quyền không tồn tại hoặc không thuộc nhà xe của tài khoản.',
      );
    }
    return roles;
  }

  /** Roles of every company (or of one when `companyId` is set). */
  async findAll(options: { companyId?: string; query?: string }) {
    const keyword = options.query?.trim();
    const qb = this.roles
      .createQueryBuilder('role')
      .innerJoinAndSelect('role.company', 'company')
      .leftJoinAndSelect('role.permissions', 'permission')
      .leftJoinAndSelect('permission.group', 'permissionGroup');

    if (options.companyId) {
      qb.where('role.company_id = :companyId', {
        companyId: options.companyId,
      });
    }

    if (keyword) {
      const filters = SEARCH_COLUMNS.map(
        (column) => `LOWER(role.${column}) LIKE :q`,
      ).join(' OR ');
      qb.andWhere(`(${filters})`, { q: `%${keyword.toLowerCase()}%` });
    }

    return qb
      .orderBy('company.name', 'ASC')
      .addOrderBy('role.name', 'ASC')
      .getMany();
  }

  async assertNameAvailable(companyId: string, name: string, excludeId?: string) {
    const qb = this.roles
      .createQueryBuilder('role')
      .where('role.company_id = :companyId', { companyId })
      .andWhere('LOWER(role.name) = LOWER(:name)', { name: name.trim() });
    if (excludeId) {
      qb.andWhere('role.id <> :excludeId', { excludeId });
    }
    if (await qb.getExists()) {
      throw new ConflictException('Tên vai trò đã tồn tại trong nhà xe.');
    }
  }
}
