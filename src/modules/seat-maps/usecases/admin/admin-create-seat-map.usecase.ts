import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { AdminCreateSeatMapDto } from '../../dto/admin/admin-create-seat-map.dto.js';
import {
  normalizeSeatMapCode,
  normalizeSeatMapType,
  normalizeSeats,
  toAdminSeatMap,
} from '../../mappers/admin/admin-seat-map.mapper.js';
import { AdminSeatMapRepository } from '../../repository/admin/admin-seat-map.repository.js';

function positiveOr(value: number | undefined, fallback: number) {
  return value && value > 0 ? value : fallback;
}

/** Creates a seat map for any company named by `company_uuid` (no company-scope restriction). */
@Injectable()
export class AdminCreateSeatMapUseCase {
  constructor(
    private readonly seatMaps: AdminSeatMapRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `actorUsername` is the username of the admin creating the seat map. */
  async execute(dto: AdminCreateSeatMapDto, actorUsername: string) {
    const company = await this.companies.findByUuid(dto.company_uuid);
    const seatMapCode = normalizeSeatMapCode(dto.seat_map_code);
    await this.seatMaps.assertUnique(company.id, seatMapCode);
    const floors = positiveOr(dto.floors, 1);
    const rows = positiveOr(dto.rows, 10);
    const columns = positiveOr(dto.columns, 4);

    const saved = await this.seatMaps.save(
      this.seatMaps.create({
        uuid: crypto.randomUUID(),
        company_id: company.id,
        company,
        seat_map_code: seatMapCode,
        name: dto.name?.trim() || seatMapCode,
        layout_type: normalizeSeatMapType(dto.layout_type),
        floors,
        rows,
        columns,
        seats: normalizeSeats(dto.seats, floors, rows, columns),
        note: dto.note?.trim() ?? '',
        is_active: dto.is_active ?? true,
        created_by: actorUsername || null,
        updated_by: actorUsername || null,
      }),
    );
    saved.company = company;
    return toAdminSeatMap(saved);
  }
}
