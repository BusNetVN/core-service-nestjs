import { Injectable } from '@nestjs/common';
import { normalizeSeatMapCode } from '../../mappers/operator/operator-seat-map.mapper.js';
import { OperatorSeatMapRepository } from '../../repository/operator/operator-seat-map.repository.js';
import { findCompanySeatMap } from './operator-find-company-seat-map.js';

@Injectable()
export class OperatorDeleteSeatMapUseCase {
  constructor(private readonly seatMaps: OperatorSeatMapRepository) {}

  async execute(companyUuid: string, uuid: string) {
    const seatMap = await findCompanySeatMap(this.seatMaps, companyUuid, uuid);
    await this.seatMaps.remove(seatMap);
    return {
      id: seatMap.uuid,
      seat_map_code: normalizeSeatMapCode(seatMap.seat_map_code),
    };
  }
}
