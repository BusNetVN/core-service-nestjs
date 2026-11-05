import { Injectable } from '@nestjs/common';
import { AdminUpdateSeatMapDto } from '../../dto/admin/admin-update-seat-map.dto.js';
import { SeatMap } from '../../entities/seat-map.entity.js';
import {
  normalizeSeatMapCode,
  normalizeSeatMapType,
  normalizeSeats,
  toAdminSeatMap,
} from '../../mappers/admin/admin-seat-map.mapper.js';
import { AdminSeatMapRepository } from '../../repository/admin/admin-seat-map.repository.js';

/** Fields sent in `dto`; the grid is rebuilt when its size or seats change. */
function changedFields(dto: AdminUpdateSeatMapDto, current: SeatMap): Partial<SeatMap> {
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

/** Partial update; the company of a seat map cannot be changed. */
@Injectable()
export class AdminUpdateSeatMapUseCase {
  constructor(private readonly seatMaps: AdminSeatMapRepository) {}

  /** `actorUsername` is the username of the admin updating the seat map. */
  async execute(uuid: string, dto: AdminUpdateSeatMapDto, actorUsername: string) {
    const seatMap = await this.seatMaps.findByUuid(uuid);
    if (dto.seat_map_code) {
      await this.seatMaps.assertUnique(seatMap.company_id, dto.seat_map_code, seatMap.id);
    }

    this.seatMaps.merge(seatMap, {
      ...changedFields(dto, seatMap),
      updated_by: actorUsername || null,
    });
    const saved = await this.seatMaps.save(seatMap);
    saved.company = seatMap.company;
    return toAdminSeatMap(saved);
  }
}
