import { Injectable } from '@nestjs/common';
import { normalizeOfficeCode } from '../../mappers/operator/operator-office.mapper.js';
import { OperatorOfficeRepository } from '../../repository/operator/operator-office.repository.js';
import { findCompanyOffice } from './operator-find-company-office.js';

/** Hard delete; vehicles assigned to the office keep existing with office_id set to NULL. */
@Injectable()
export class OperatorDeleteOfficeUseCase {
  constructor(private readonly offices: OperatorOfficeRepository) {}

  async execute(companyUuid: string, uuid: string) {
    const office = await findCompanyOffice(this.offices, companyUuid, uuid);
    await this.offices.remove(office);
    return {
      id: office.uuid,
      office_code: normalizeOfficeCode(office.office_code),
    };
  }
}
