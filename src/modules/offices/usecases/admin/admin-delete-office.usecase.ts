import { Injectable } from '@nestjs/common';
import { normalizeOfficeCode } from '../../mappers/admin/admin-office.mapper.js';
import { OfficeRepository } from '../../repository/office.repository.js';

/** Hard delete; vehicles assigned to the office keep existing with office_id set to NULL. */
@Injectable()
export class AdminDeleteOfficeUseCase {
  constructor(private readonly offices: OfficeRepository) {}

  async execute(uuid: string) {
    const office = await this.offices.findByUuid(uuid);
    await this.offices.remove(office);
    return {
      id: office.uuid,
      office_code: normalizeOfficeCode(office.office_code),
    };
  }
}
