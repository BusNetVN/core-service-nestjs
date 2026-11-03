import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { ProvinceRepository } from '../../../locations/repository/province.repository.js';
import { WardRepository } from '../../../locations/repository/ward.repository.js';
import { AdminUpdatePointDto } from '../../dto/admin/admin-update-point.dto.js';
import { Point } from '../../entities/point.entity.js';
import type { PointTypeValue } from '../../enums/point-type.enum.js';
import { normalizePointCode, toPublicPoint } from '../../mappers/point.mapper.js';
import { PointRepository } from '../../repository/point.repository.js';
import { resolveAllowedCompanies } from '../resolve-allowed-companies.js';
import { resolvePointLocation } from '../resolve-point-location.js';
import { findSharedPoint } from './find-shared-point.js';

/** Partial update of a shared point; company points are managed by their company. */
@Injectable()
export class AdminUpdatePointUseCase {
  constructor(
    private readonly points: PointRepository,
    private readonly companies: CompanyRepository,
    private readonly provinces: ProvinceRepository,
    private readonly wards: WardRepository,
  ) {}

  /** `actorUsername` is the username of the admin updating the point. */
  async execute(uuid: string, dto: AdminUpdatePointDto, actorUsername: string) {
    const point = await findSharedPoint(this.points, uuid);
    const fields: Partial<Point> = { updated_by: actorUsername || null };

    if (dto.point_code !== undefined) {
      fields.point_code = normalizePointCode(dto.point_code);
    }
    if (dto.name !== undefined) fields.name = dto.name;
    // Same rule as on create, so an edit cannot introduce a duplicate either.
    await this.points.assertSystemPointUnique({
      pointCode: fields.point_code,
      name: fields.name,
      excludeId: point.id,
    });
    if (dto.point_type !== undefined) {
      fields.point_type = dto.point_type as PointTypeValue;
    }
    if (dto.address !== undefined) fields.address = dto.address;
    if (dto.note !== undefined) fields.note = dto.note;
    if (dto.status !== undefined) fields.status = dto.status;

    if (dto.province_uuid !== undefined || dto.ward_uuid !== undefined) {
      const location = await resolvePointLocation(
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

    const allowedCompanies = await resolveAllowedCompanies(
      this.companies,
      dto.allowed_company_uuids,
    );

    this.points.merge(point, fields);
    const saved = await this.points.save(point);
    if (allowedCompanies !== undefined) {
      await this.points.syncAllowedCompanies(saved.id, allowedCompanies);
      saved.allowed_companies = allowedCompanies;
    }

    saved.company = null;
    saved.province = point.province;
    saved.ward = point.ward;
    saved.allowed_companies ??= point.allowed_companies;
    return toPublicPoint(saved);
  }
}
