import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';
import { Company } from '../entities/company.entity.js';
import { normalizeCompanyCode } from '../mappers/company.mapper.js';

const SEARCH_COLUMNS = [
  'name',
  'short_name',
  'company_code',
  'slug',
  'phone',
  'email',
  'tax_code',
] as const;

@Injectable()
export class CompanyRepository implements OnModuleInit {
  constructor(
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
  ) {}

  async onModuleInit() {
    await this.companies.query(
      `UPDATE tbl_companies SET company_code = LOWER(company_code) WHERE company_code <> LOWER(company_code)`,
    );
  }

  create(data: Partial<Company>) {
    return this.companies.create(data);
  }

  save(company: Company) {
    return this.companies.save(company);
  }

  merge(company: Company, fields: Partial<Company>) {
    return this.companies.merge(company, fields);
  }

  remove(company: Company) {
    return this.companies.remove(company);
  }

  async findByUuids(uuids: string[]) {
    const unique = [...new Set(uuids)];
    if (unique.length === 0) {
      return [];
    }
    return this.companies.find({ where: { uuid: In(unique) } });
  }

  async findByUuid(uuid: string) {
    const company = await this.companies.findOne({ where: { uuid } });
    if (!company) {
      throw new NotFoundException('Không tìm thấy nhà xe.');
    }
    return company;
  }

  findOptionalByUuid(uuid: string) {
    return this.companies.findOne({ where: { uuid } });
  }

  async hasActiveUsers(companyId: string) {
    const [row] = (await this.companies.query(
      `SELECT EXISTS (
        SELECT 1 FROM tbl_users WHERE company_id = $1 AND deleted_at IS NULL
      ) AS used`,
      [companyId],
    )) as Array<{ used: boolean }>;
    return row?.used === true;
  }

  async findAll(query?: string) {
    const keyword = query?.trim();
    const qb = this.companies.createQueryBuilder('company');

    if (keyword) {
      const filters = SEARCH_COLUMNS.map(
        (column) => `LOWER(company.${column}) LIKE :q`,
      ).join(' OR ');
      qb.where(`(${filters})`, { q: `%${keyword.toLowerCase()}%` });
    }

    return qb.orderBy('company.created_at', 'DESC').getMany();
  }

  async assertUnique(
    companyCode?: string,
    slug?: string,
    excludeId?: string,
  ) {
    if (companyCode) {
      const code = normalizeCompanyCode(companyCode);
      const existed = await this.companies.findOne({
        where: excludeId
          ? { company_code: ILike(code), id: Not(excludeId) }
          : { company_code: ILike(code) },
      });
      if (existed) {
        throw new ConflictException('Mã công ty đã tồn tại.');
      }
    }

    if (slug) {
      const existed = await this.companies.findOne({
        where: excludeId ? { slug, id: Not(excludeId) } : { slug },
      });
      if (existed) {
        throw new ConflictException('Slug đã tồn tại.');
      }
    }
  }
}
