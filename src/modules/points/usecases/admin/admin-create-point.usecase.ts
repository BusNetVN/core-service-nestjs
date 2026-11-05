import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { ProvinceRepository } from '../../../locations/repository/province.repository.js';
import { WardRepository } from '../../../locations/repository/ward.repository.js';
import { AdminCreatePointDto } from '../../dto/admin/admin-create-point.dto.js';
import { PointScope } from '../../enums/point-scope.enum.js';
import type { PointTypeValue } from '../../enums/point-type.enum.js';
import { normalizePointCode, toAdminPoint } from '../../mappers/admin/admin-point.mapper.js';
import { AdminPointRepository } from '../../repository/admin/admin-point.repository.js';
import { resolveAdminAllowedCompanies } from './admin-resolve-allowed-companies.js';
import { resolveAdminPointLocation } from './admin-resolve-point-location.js';

/** Creates a shared point (scope SYSTEM, no owner company). */
@Injectable()
export class AdminCreatePointUseCase {
  constructor(
    private readonly points: AdminPointRepository,
    private readonly companies: CompanyRepository,
    private readonly provinces: ProvinceRepository,
    private readonly wards: WardRepository,
  ) {}

  /** `actorUsername` is the username of the admin creating the point. */
  async execute(dto: AdminCreatePointDto, actorUsername: string) {
    const pointCode = normalizePointCode(dto.point_code);
    await this.points.assertSystemPointUnique({ pointCode, name: dto.name });
    const location = await resolveAdminPointLocation(
      this.provinces,
      this.wards,
      dto.province_uuid,
      dto.ward_uuid,
    );
    const allowedCompanies =
      (await resolveAdminAllowedCompanies(this.companies, dto.allowed_company_uuids)) ?? [];

    const saved = await this.points.save(
      this.points.create({
        uuid: crypto.randomUUID(),
        company_id: null,
        company: null,
        scope: PointScope.SYSTEM,
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
    await this.points.syncAllowedCompanies(saved.id, allowedCompanies);

    saved.company = null;
    saved.province = location.province;
    saved.ward = location.ward;
    saved.allowed_companies = allowedCompanies;
    return toAdminPoint(saved);
  }
}
