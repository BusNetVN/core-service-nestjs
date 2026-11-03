import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { AdminCreateOfficeDto } from '../../dto/admin/admin-create-office.dto.js';
import {
  normalizeOfficeCode,
  normalizePhones,
  toAdminOffice,
} from '../../mappers/admin/admin-office.mapper.js';
import { OfficeRepository } from '../../repository/office.repository.js';

/** Creates an office for any company named by `company_uuid` (no company-scope restriction). */
@Injectable()
export class AdminCreateOfficeUseCase {
  constructor(
    private readonly offices: OfficeRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `actorUsername` is the username of the admin creating the office. */
  async execute(dto: AdminCreateOfficeDto, actorUsername: string) {
    const company = await this.companies.findByUuid(dto.company_uuid);
    const officeCode = normalizeOfficeCode(dto.office_code);
    await this.offices.assertUnique(company.id, officeCode);

    const saved = await this.offices.save(
      this.offices.create({
        uuid: crypto.randomUUID(),
        company_id: company.id,
        company,
        office_code: officeCode,
        name: dto.name,
        address: dto.address,
        phones: normalizePhones(dto.phones),
        note: dto.note?.trim() ?? '',
        created_by: actorUsername || null,
        updated_by: actorUsername || null,
      }),
    );
    saved.company = company;
    return toAdminOffice(saved);
  }
}
