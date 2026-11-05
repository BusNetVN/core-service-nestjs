import { Injectable } from '@nestjs/common';
import { OperatorUpdateSeatMapDto } from '../../dto/operator/operator-update-seat-map.dto.js';
import { SeatMap } from '../../entities/seat-map.entity.js';
import {
  normalizeSeatMapCode,
  normalizeSeatMapType,
  normalizeSeats,
  toOperatorSeatMap,
} from '../../mappers/operator/operator-seat-map.mapper.js';
import { OperatorSeatMapRepository } from '../../repository/operator/operator-seat-map.repository.js';
import { findCompanySeatMap } from './operator-find-company-seat-map.js';

/** Fields sent in `dto`; the grid is rebuilt when its size or seats change. */
function changedFields(dto: OperatorUpdateSeatMapDto, current: SeatMap): Partial<SeatMap> {
  const fields: Partial<SeatMap> = {};
  if (dto.seat_map_code !== undefined) fields.seat_map_code = normalizeSeatMapCode(dto.seat_map_code);
  if (dto.layout_type !== undefined) fields.layout_type = normalizeSeatMapType(dto.layout_type);
  if (dto.floors !== undefined) fields.floors = dto.floors;
  if (dto.rows !== undefined) fields.rows = dto.rows;
  if (dto.columns !== undefined) fields.columns = dto.columns;
  if (dto.note !== undefined) fields.note = dto.note;
  if (dto.is_active !== undefined) fields.is_active = dto.is_active;

  if (
    dto.seats !== undefined ||
    dto.floors !== undefined ||
    dto.rows !== undefined ||
    dto.columns !== undefined
  ) {
    fields.seats = normalizeSeats(
      dto.seats ?? current.seats,
      fields.floors ?? current.floors,
      fields.rows ?? current.rows,
      fields.columns ?? current.columns,
    );
  }

  if (dto.name !== undefined) {
    fields.name = dto.name.trim() || fields.seat_map_code || current.seat_map_code;
  }
  return fields;
}

/** Partial update of a seat map of `companyUuid`; the company itself cannot change. */
@Injectable()
export class OperatorUpdateSeatMapUseCase {
  constructor(private readonly seatMaps: OperatorSeatMapRepository) {}

  /** `actorUsername` is the username of the staff member updating the seat map. */
  async execute(
    companyUuid: string,
    uuid: string,
    dto: OperatorUpdateSeatMapDto,
    actorUsername: string,
  ) {
    const seatMap = await findCompanySeatMap(this.seatMaps, companyUuid, uuid);
    if (dto.seat_map_code) {
      await this.seatMaps.assertUnique(seatMap.company_id, dto.seat_map_code, seatMap.id);
    }

    this.seatMaps.merge(seatMap, {
      ...changedFields(dto, seatMap),
      updated_by: actorUsername || null,
    });
    const saved = await this.seatMaps.save(seatMap);
    saved.company = seatMap.company;
    return toOperatorSeatMap(saved);
  }
}
