import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Office } from '../../entities/office.entity.js';

const SEARCH_COLUMNS = ['office_code', 'name', 'address', 'note'] as const;
const COMPANY_RELATION = { company: true } as const;

/** Office data access for /api/operator/offices (and company-scoped modules such as vehicles). */
@Injectable()
export class OperatorOfficeRepository {
  constructor(
    @InjectRepository(Office)
    private readonly offices: Repository<Office>,
  ) {}

  create(data: Partial<Office>) {
    return this.offices.create(data);
  }

  save(office: Office) {
    return this.offices.save(office);
  }

  merge(office: Office, fields: Partial<Office>) {
    return this.offices.merge(office, fields);
  }

  remove(office: Office) {
    return this.offices.remove(office);
  }

  /** Callers must still check that the office belongs to their company. */
  async findByUuid(uuid: string) {
    const office = await this.offices.findOne({
      where: { uuid },
      relations: COMPANY_RELATION,
    });
    if (!office) {
      throw new NotFoundException('Không tìm thấy văn phòng.');
    }
    return office;
  }

  /** Offices of one company, newest first. */
  async findAll(companyId: string, query?: string) {
    const keyword = query?.trim();
    const qb = this.offices
      .createQueryBuilder('office')
      .innerJoinAndSelect('office.company', 'company')
      .where('office.company_id = :companyId', { companyId });

    if (keyword) {
      const filters = SEARCH_COLUMNS.map(
        (column) => `LOWER(office.${column}) LIKE :q`,
      ).join(' OR ');
      qb.andWhere(`(${filters} OR CAST(office.phones AS TEXT) ILIKE :q)`, {
        q: `%${keyword.toLowerCase()}%`,
      });
    }

    return qb.orderBy('office.created_at', 'DESC').getMany();
  }

  /** Office codes are unique per company, compared case-insensitively. */
  async assertUnique(
    companyId: string,
    officeCode: string,
    excludeId?: string,
  ) {
    const code = officeCode.trim().toUpperCase();
    const existed = await this.offices.findOne({
      where: excludeId
        ? {
            company_id: companyId,
            office_code: ILike(code),
            id: Not(excludeId),
          }
        : { company_id: companyId, office_code: ILike(code) },
    });

    if (existed) {
      throw new ConflictException('Mã văn phòng đã tồn tại.');
    }
  }
}
