import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AccountType } from '../../../../common/constants/account.constant.js';
import { User } from '../../entities/user.entity.js';

const SEARCH_COLUMNS = ['username', 'full_name', 'email', 'phone_number'] as const;

/** Account data access for /api/operator/users (and /api/operator/auth via the export). */
@Injectable()
export class OperatorUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    return this.users.create(data);
  }

  save(user: User) {
    return this.users.save(user);
  }

  /** Soft-deleted accounts are returned too; callers check deleted_at. */
  findByUsername(username: string) {
    return this.users.findOne({
      where: { username },
      relations: { company: true },
    });
  }

  /**
   * Soft-deleted users are treated as not found. Callers must still check that the account
   * belongs to their company.
   */
  async findActiveByUuid(uuid: string) {
    const user = await this.users.findOne({
      where: { uuid, deleted_at: IsNull() },
      relations: { company: true },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }
    return user;
  }

  /** COMPANY_STAFF accounts of one company that are not deleted, newest first. */
  async findAllCompanyStaff(companyUuid: string, query?: string) {
    const keyword = query?.trim();
    const qb = this.users
      .createQueryBuilder('account')
      .innerJoinAndSelect('account.company', 'company')
      .where('account.deleted_at IS NULL')
      .andWhere('company.uuid = :companyUuid', { companyUuid })
      .andWhere('account.account_type = :accountType', {
        accountType: AccountType.COMPANY_STAFF,
      });

    if (keyword) {
      const filters = SEARCH_COLUMNS.map(
        (column) => `LOWER(account.${column}) LIKE :q`,
      ).join(' OR ');
      qb.andWhere(`(${filters})`, { q: `%${keyword.toLowerCase()}%` });
    }

    return qb.orderBy('account.created_at', 'DESC').getMany();
  }

  /** Usernames stay reserved after a soft delete, so deleted rows count too. */
  async assertUsernameAvailable(username: string, excludeId?: string) {
    const existed = await this.users.exists({
      where: excludeId ? { username, id: Not(excludeId) } : { username },
    });
    if (existed) {
      throw new ConflictException('Tên đăng nhập đã tồn tại.');
    }
  }

  async assertEmailAvailable(email: string, excludeId?: string) {
    const existed = await this.users.exists({
      where: excludeId
        ? { email, deleted_at: IsNull(), id: Not(excludeId) }
        : { email, deleted_at: IsNull() },
    });
    if (existed) {
      throw new ConflictException('Email đã tồn tại.');
    }
  }
}
