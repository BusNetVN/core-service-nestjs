import { Injectable } from '@nestjs/common';
import { toAdminSeatMap } from '../../mappers/admin/admin-seat-map.mapper.js';
import { AdminSeatMapRepository } from '../../repository/admin/admin-seat-map.repository.js';

@Injectable()
export class AdminFindSeatMapUseCase {
  constructor(private readonly seatMaps: AdminSeatMapRepository) {}

  async execute(uuid: string) {
    return toAdminSeatMap(await this.seatMaps.findByUuid(uuid));
  }
}
