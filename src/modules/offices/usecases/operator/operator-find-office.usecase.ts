import { Injectable } from '@nestjs/common';
import { toOperatorOffice } from '../../mappers/operator/operator-office.mapper.js';
import { OperatorOfficeRepository } from '../../repository/operator/operator-office.repository.js';
import { findCompanyOffice } from './operator-find-company-office.js';

@Injectable()
export class OperatorFindOfficeUseCase {
  constructor(private readonly offices: OperatorOfficeRepository) {}

  async execute(companyUuid: string, uuid: string) {
    return toOperatorOffice(
      await findCompanyOffice(this.offices, companyUuid, uuid),
    );
  }
}
