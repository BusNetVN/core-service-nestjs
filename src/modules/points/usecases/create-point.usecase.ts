import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { ProvinceRepository } from '../../locations/repository/province.repository.js';
import { WardRepository } from '../../locations/repository/ward.repository.js';
import { CreatePointDto } from '../dto/create-point.dto.js';
import { PointScope } from '../enums/point-scope.enum.js';
import type { PointTypeValue } from '../enums/point-type.enum.js';
import { normalizePointCode, toPublicPoint } from '../mappers/point.mapper.js';
import { PointRepository } from '../repository/point.repository.js';
import { resolveAllowedCompanies } from './resolve-allowed-companies.js';
import { resolvePointLocation } from './resolve-point-location.js';

@Injectable()
export class CreatePointUseCase {
  constructor(
    private readonly points: PointRepository,
    private readonly companies: CompanyRepository,
    private readonly provinces: ProvinceRepository,
    private readonly wards: WardRepository,
  ) {}

  /** `actorUsername` is the username of the user creating the point. */
  async execute(dto: CreatePointDto, actorUsername: string) {
    const company = dto.company_uuid
      ? await this.companies.findByUuid(dto.company_uuid)
      : null;
    const location = await resolvePointLocation(
      this.provinces,
      this.wards,
      dto.province_uuid,
      dto.ward_uuid,
    );
    const pointCode = normalizePointCode(dto.point_code);
    await this.points.assertUnique(company?.id ?? null, pointCode);

    const allowedCompanies = company
      ? []
      : ((await resolveAllowedCompanies(
          this.companies,
          dto.allowed_company_uuids,
        )) ?? []);
    const point = this.points.create({
      uuid: crypto.randomUUID(),
      company_id: company?.id ?? null,
      company,
      scope: company ? PointScope.COMPANY : PointScope.SYSTEM,
      point_code: pointCode,
      name: dto.name,
      point_type: dto.point_type as PointTypeValue,
      province_id: location.province_id,
      ward_id: location.ward_id,
      address: dto.address?.trim() ?? '',
      note: dto.note?.trim() ?? '',
      status: dto.status ?? true,
      created_by: actorUsername || null,
      updated_by: actorUsername || null,
    });
    const saved = await this.points.save(point);
    if (!company) {
      await this.points.syncAllowedCompanies(saved.id, allowedCompanies);
    }
    saved.company = company;
    saved.province = location.province;
    saved.ward = location.ward;
    saved.allowed_companies = allowedCompanies;
    return toPublicPoint(saved);
  }
}
