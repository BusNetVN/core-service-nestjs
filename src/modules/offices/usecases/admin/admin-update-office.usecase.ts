import { Injectable } from '@nestjs/common';
import { AdminUpdateOfficeDto } from '../../dto/admin/admin-update-office.dto.js';
import { Office } from '../../entities/office.entity.js';
import {
  normalizeOfficeCode,
  normalizePhones,
  toAdminOffice,
} from '../../mappers/admin/admin-office.mapper.js';
import { OfficeRepository } from '../../repository/office.repository.js';

/**
 * Partial update of any office. The company cannot be changed: vehicles of the
 * company point at the office, so moving it would mix data of two companies.
 */
@Injectable()
export class AdminUpdateOfficeUseCase {
  constructor(private readonly offices: OfficeRepository) {}

  /** `actorUsername` is the username of the admin updating the office. */
  async execute(
    uuid: string,
    dto: AdminUpdateOfficeDto,
    actorUsername: string,
  ) {
    const office = await this.offices.findByUuid(uuid);
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
    return toAdminOffice(saved);
  }
}
