import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { ProvinceRepository } from '../../../locations/repository/province.repository.js';
import { WardRepository } from '../../../locations/repository/ward.repository.js';
import { OperatorCreatePointDto } from '../../dto/operator/operator-create-point.dto.js';
import { PointScope } from '../../enums/point-scope.enum.js';
import type { PointTypeValue } from '../../enums/point-type.enum.js';
import {
  normalizePointCode,
  toOperatorPoint,
} from '../../mappers/operator/operator-point.mapper.js';
import { OperatorPointRepository } from '../../repository/operator/operator-point.repository.js';
import { resolveOperatorPointLocation } from './operator-resolve-point-location.js';

/** Creates a point of the company in the access token (scope COMPANY). */
@Injectable()
export class OperatorCreatePointUseCase {
  constructor(
    private readonly points: OperatorPointRepository,
    private readonly companies: CompanyRepository,
    private readonly provinces: ProvinceRepository,
    private readonly wards: WardRepository,
  ) {}

  /** `actorUsername` is the username of the staff member creating the point. */
  async execute(
    companyUuid: string,
    dto: OperatorCreatePointDto,
    actorUsername: string,
  ) {
    const company = await this.companies.findByUuid(companyUuid);
    const pointCode = normalizePointCode(dto.point_code);
    await this.points.assertUnique(company.id, pointCode);
    const location = await resolveOperatorPointLocation(
      this.provinces,
      this.wards,
      dto.province_uuid,
      dto.ward_uuid,
    );

    const saved = await this.points.save(
      this.points.create({
        uuid: crypto.randomUUID(),
        company_id: company.id,
        company,
        scope: PointScope.COMPANY,
        point_code: pointCode,
        name: dto.name,
        point_type: dto.point_type as PointTypeValue,
        province_id: location.province_id,
        ward_id: location.ward_id,
        address: dto.address ?? '',
        note: dto.note ?? '',
        is_active: dto.is_active ?? true,
        created_by: actorUsername || null,
        updated_by: actorUsername || null,
      }),
    );
    saved.company = company;
    saved.province = location.province;
    saved.ward = location.ward;
    return toOperatorPoint(saved);
  }
}
