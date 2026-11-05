import { Injectable } from '@nestjs/common';
import { ProvinceRepository } from '../../../locations/repository/province.repository.js';
import { WardRepository } from '../../../locations/repository/ward.repository.js';
import { OperatorUpdatePointDto } from '../../dto/operator/operator-update-point.dto.js';
import { Point } from '../../entities/point.entity.js';
import type { PointTypeValue } from '../../enums/point-type.enum.js';
import {
  normalizePointCode,
  toOperatorPoint,
} from '../../mappers/operator/operator-point.mapper.js';
import { OperatorPointRepository } from '../../repository/operator/operator-point.repository.js';
import { findCompanyPoint } from './operator-find-company-point.js';
import { resolveOperatorPointLocation } from './operator-resolve-point-location.js';

/** Partial update of a point of `companyUuid`; shared points are read only (403). */
@Injectable()
export class OperatorUpdatePointUseCase {
  constructor(
    private readonly points: OperatorPointRepository,
    private readonly provinces: ProvinceRepository,
    private readonly wards: WardRepository,
  ) {}

  /** `actorUsername` is the username of the staff member updating the point. */
  async execute(
    companyUuid: string,
    uuid: string,
    dto: OperatorUpdatePointDto,
    actorUsername: string,
  ) {
    const point = await findCompanyPoint(this.points, companyUuid, uuid);
    const fields: Partial<Point> = { updated_by: actorUsername || null };

    if (dto.point_code !== undefined) {
      fields.point_code = normalizePointCode(dto.point_code);
      await this.points.assertUnique(point.company.id, fields.point_code, point.id);
    }
    if (dto.name !== undefined) fields.name = dto.name;
    if (dto.point_type !== undefined) {
      fields.point_type = dto.point_type as PointTypeValue;
    }
    if (dto.address !== undefined) fields.address = dto.address;
    if (dto.note !== undefined) fields.note = dto.note;
    if (dto.is_active !== undefined) fields.is_active = dto.is_active;

    if (dto.province_uuid !== undefined || dto.ward_uuid !== undefined) {
      const location = await resolveOperatorPointLocation(
        this.provinces,
        this.wards,
        dto.province_uuid,
        dto.ward_uuid,
      );
      fields.province_id = location.province_id;
      fields.ward_id = location.ward_id;
      point.province = location.province;
      point.ward = location.ward;
    }

    this.points.merge(point, fields);
    const saved = await this.points.save(point);
    saved.company = point.company;
    saved.province = point.province;
    saved.ward = point.ward;
    return toOperatorPoint(saved);
  }
}
