import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { ProvinceRepository } from '../../locations/repository/province.repository.js';
import { WardRepository } from '../../locations/repository/ward.repository.js';
import { UpdatePointDto } from '../dto/update-point.dto.js';
import { Point } from '../entities/point.entity.js';
import { normalizePointCode, toPublicPoint } from '../mappers/point.mapper.js';
import { PointRepository } from '../repository/point.repository.js';
import { resolveAllowedCompanies } from './resolve-allowed-companies.js';
import { resolvePointLocation } from './resolve-point-location.js';

const SKIP_KEYS = ['province_uuid', 'ward_uuid', 'allowed_company_uuids'] as const;

@Injectable()
export class UpdatePointUseCase {
  constructor(
    private readonly points: PointRepository,
    private readonly companies: CompanyRepository,
    private readonly provinces: ProvinceRepository,
    private readonly wards: WardRepository,
  ) {}

  /** `actorUsername` is the username of the user updating the point. */
  async execute(uuid: string, dto: UpdatePointDto, actorUsername: string) {
    const point = await this.points.findByUuid(uuid);
    if (dto.point_code) {
      await this.points.assertUnique(
        point.company_id,
        normalizePointCode(dto.point_code),
        point.id,
      );
    }

    if (dto.province_uuid !== undefined || dto.ward_uuid !== undefined) {
      const location = await resolvePointLocation(
        this.provinces,
        this.wards,
        dto.province_uuid,
        dto.ward_uuid,
      );
      point.province_id = location.province_id;
      point.province = location.province;
      point.ward_id = location.ward_id;
      point.ward = location.ward;
    }

    this.points.merge(point, {
      ...this.definedFields(dto),
      updated_by: actorUsername || null,
    });
    const nextAllowed =
      !point.company_id && dto.allowed_company_uuids !== undefined
        ? ((await resolveAllowedCompanies(
            this.companies,
            dto.allowed_company_uuids,
          )) ?? [])
        : undefined;
    const saved = await this.points.save(point);
    if (nextAllowed !== undefined) {
      await this.points.syncAllowedCompanies(saved.id, nextAllowed);
      saved.allowed_companies = nextAllowed;
    }
    saved.company = point.company;
    saved.province = point.province;
    saved.ward = point.ward;
    saved.allowed_companies ??= point.allowed_companies;
    return toPublicPoint(saved);
  }

  private definedFields(dto: UpdatePointDto): Partial<Point> {
    const fields: Partial<Point> = {};
    (Object.keys(dto) as Array<keyof UpdatePointDto>).forEach((key) => {
      const value = dto[key];
      if (value === undefined || SKIP_KEYS.includes(key as (typeof SKIP_KEYS)[number])) {
        return;
      }

      if (key === 'point_code' && typeof value === 'string') {
        fields.point_code = normalizePointCode(value);
        return;
      }

      (fields as Record<string, unknown>)[key] = value;
    });
    return fields;
  }
}
