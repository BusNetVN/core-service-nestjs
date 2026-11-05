import { Injectable } from '@nestjs/common';
import { toOperatorSeatMap } from '../../mappers/operator/operator-seat-map.mapper.js';
import { OperatorSeatMapRepository } from '../../repository/operator/operator-seat-map.repository.js';
import { findCompanySeatMap } from './operator-find-company-seat-map.js';

@Injectable()
export class OperatorFindSeatMapUseCase {
  constructor(private readonly seatMaps: OperatorSeatMapRepository) {}

  async execute(companyUuid: string, uuid: string) {
    return toOperatorSeatMap(
      await findCompanySeatMap(this.seatMaps, companyUuid, uuid),
    );
  }
}
