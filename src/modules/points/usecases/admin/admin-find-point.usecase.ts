import { Injectable } from '@nestjs/common';
import { toAdminPoint } from '../../mappers/admin/admin-point.mapper.js';
import { AdminPointRepository } from '../../repository/admin/admin-point.repository.js';

/** Any point, shared or of a company. */
@Injectable()
export class AdminFindPointUseCase {
  constructor(private readonly points: AdminPointRepository) {}

  async execute(uuid: string) {
    return toAdminPoint(await this.points.findByUuid(uuid));
  }
}
