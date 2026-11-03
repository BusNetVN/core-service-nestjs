import { Injectable } from '@nestjs/common';
import { toAdminOffice } from '../../mappers/admin/admin-office.mapper.js';
import { AdminOfficeRepository } from '../../repository/admin/admin-office.repository.js';

/** Any office, whatever its company. */
@Injectable()
export class AdminFindOfficeUseCase {
  constructor(private readonly offices: AdminOfficeRepository) {}

  async execute(uuid: string) {
    return toAdminOffice(await this.offices.findByUuid(uuid));
  }
}
