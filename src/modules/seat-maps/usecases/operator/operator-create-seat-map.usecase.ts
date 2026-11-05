import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { OperatorCreateSeatMapDto } from '../../dto/operator/operator-create-seat-map.dto.js';
import {
  normalizeSeatMapCode,
  normalizeSeatMapType,
  normalizeSeats,
  toOperatorSeatMap,
} from '../../mappers/operator/operator-seat-map.mapper.js';
import { OperatorSeatMapRepository } from '../../repository/operator/operator-seat-map.repository.js';

function positiveOr(value: number | undefined, fallback: number) {
  return value && value > 0 ? value : fallback;
}

/** Creates a seat map of the company in the access token. */
@Injectable()
export class OperatorCreateSeatMapUseCase {
  constructor(
    private readonly seatMaps: OperatorSeatMapRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `actorUsername` is the username of the staff member creating the seat map. */
  async execute(
    companyUuid: string,
    dto: OperatorCreateSeatMapDto,
    actorUsername: string,
  ) {
    const company = await this.companies.findByUuid(companyUuid);
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
    return toOperatorSeatMap(saved);
  }
}
