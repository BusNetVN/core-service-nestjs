import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { toAdminOffice } from '../../mappers/admin/admin-office.mapper.js';
import { OfficeRepository } from '../../repository/office.repository.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Unlike OperatorFindAllOfficesUseCase, the company is optional: without it, offices of every company are listed. */
@Injectable()
export class AdminFindAllOfficesUseCase {
  constructor(
    private readonly offices: OfficeRepository,
    private readonly companies: CompanyRepository,
  ) {}

  async execute(options: { companyUuid?: string; query?: string }) {
    let companyId: string | undefined;
    if (options.companyUuid) {
      if (!UUID_V4.test(options.companyUuid)) {
        throw new BadRequestException('Nhà xe không hợp lệ.');
      }
      companyId = (await this.companies.findByUuid(options.companyUuid)).id;
    }

    const offices = await this.offices.findAllForAdmin({
      companyId,
      query: options.query,
    });
    return offices.map(toAdminOffice);
  }
}
