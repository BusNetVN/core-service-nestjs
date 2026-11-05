import { Injectable } from '@nestjs/common';
import { normalizeSeatMapCode } from '../../mappers/admin/admin-seat-map.mapper.js';
import { AdminSeatMapRepository } from '../../repository/admin/admin-seat-map.repository.js';

@Injectable()
export class AdminDeleteSeatMapUseCase {
  constructor(private readonly seatMaps: AdminSeatMapRepository) {}

  async execute(uuid: string) {
    const seatMap = await this.seatMaps.findByUuid(uuid);
    await this.seatMaps.remove(seatMap);
    return {
      id: seatMap.uuid,
      seat_map_code: normalizeSeatMapCode(seatMap.seat_map_code),
    };
  }
}
