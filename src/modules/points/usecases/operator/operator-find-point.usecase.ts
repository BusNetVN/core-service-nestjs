import { Injectable } from '@nestjs/common';
import { toOperatorPoint } from '../../mappers/operator/operator-point.mapper.js';
import { OperatorPointRepository } from '../../repository/operator/operator-point.repository.js';
import { findVisiblePoint } from './operator-find-company-point.js';

@Injectable()
export class OperatorFindPointUseCase {
  constructor(private readonly points: OperatorPointRepository) {}

  async execute(companyUuid: string, uuid: string) {
    return toOperatorPoint(await findVisiblePoint(this.points, companyUuid, uuid));
  }
}
