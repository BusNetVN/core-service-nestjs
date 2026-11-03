import { Injectable } from '@nestjs/common';
import { toOperatorOffice } from '../../mappers/operator/operator-office.mapper.js';
import { OfficeRepository } from '../../repository/office.repository.js';
import { findCompanyOffice } from './find-company-office.js';

@Injectable()
export class OperatorFindOfficeUseCase {
  constructor(private readonly offices: OfficeRepository) {}

  async execute(companyUuid: string, uuid: string) {
    return toOperatorOffice(
      await findCompanyOffice(this.offices, companyUuid, uuid),
    );
  }
}
