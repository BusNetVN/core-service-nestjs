import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { OperatorCreateOfficeDto } from '../../dto/operator/operator-create-office.dto.js';
import {
  normalizeOfficeCode,
  normalizePhones,
  toOperatorOffice,
} from '../../mappers/operator/operator-office.mapper.js';
import { OfficeRepository } from '../../repository/office.repository.js';

@Injectable()
export class OperatorCreateOfficeUseCase {
  constructor(
    private readonly offices: OfficeRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** Creates the office in `companyUuid` (from the access token); `actorUsername` is recorded. */
  async execute(
    companyUuid: string,
    dto: OperatorCreateOfficeDto,
    actorUsername: string,
  ) {
    const company = await this.companies.findByUuid(companyUuid);
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
    return toOperatorOffice(saved);
  }
}
