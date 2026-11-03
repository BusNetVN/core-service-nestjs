import { Injectable } from '@nestjs/common';
import { toPublicPoint } from '../mappers/point.mapper.js';
import { PointRepository } from '../repository/point.repository.js';

@Injectable()
export class FindPointUseCase {
  constructor(private readonly points: PointRepository) {}

  async execute(uuid: string) {
    return toPublicPoint(await this.points.findByUuid(uuid));
  }
}
