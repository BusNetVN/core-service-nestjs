import { Injectable } from '@nestjs/common';
import { OperatorUpdateOfficeDto } from '../../dto/operator/operator-update-office.dto.js';
import { Office } from '../../entities/office.entity.js';
import {
  normalizeOfficeCode,
  normalizePhones,
  toOperatorOffice,
} from '../../mappers/operator/operator-office.mapper.js';
import { OperatorOfficeRepository } from '../../repository/operator/operator-office.repository.js';
import { findCompanyOffice } from './operator-find-company-office.js';

/** Partial update of an office of `companyUuid`; the company itself cannot change. */
@Injectable()
export class OperatorUpdateOfficeUseCase {
  constructor(private readonly offices: OperatorOfficeRepository) {}

  async execute(
    companyUuid: string,
    uuid: string,
    dto: OperatorUpdateOfficeDto,
    actorUsername: string,
  ) {
    const office = await findCompanyOffice(this.offices, companyUuid, uuid);
    const fields: Partial<Office> = { updated_by: actorUsername || null };

    if (dto.office_code !== undefined) {
      fields.office_code = normalizeOfficeCode(dto.office_code);
      await this.offices.assertUnique(
        office.company_id,
        fields.office_code,
        office.id,
      );
    }
    if (dto.name !== undefined) fields.name = dto.name;
    if (dto.address !== undefined) fields.address = dto.address;
    if (dto.phones !== undefined) fields.phones = normalizePhones(dto.phones);
    if (dto.note !== undefined) fields.note = dto.note;

    this.offices.merge(office, fields);
    const saved = await this.offices.save(office);
    saved.company = office.company;
    return toOperatorOffice(saved);
  }
}
