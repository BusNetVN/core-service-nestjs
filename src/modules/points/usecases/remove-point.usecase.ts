import { Injectable } from '@nestjs/common';
import { normalizePointCode } from '../mappers/point.mapper.js';
import { PointRepository } from '../repository/point.repository.js';

@Injectable()
export class RemovePointUseCase {
  constructor(private readonly points: PointRepository) {}

  async execute(uuid: string) {
    const point = await this.points.findByUuid(uuid);
    await this.points.remove(point);
    return {
      id: point.uuid,
      point_code: normalizePointCode(point.point_code),
    };
  }
}
