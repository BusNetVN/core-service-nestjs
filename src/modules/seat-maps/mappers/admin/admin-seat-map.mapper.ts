import {
  toPublicCompany,
  type PublicCompany,
} from '../../../companies/mappers/company.mapper.js';
import {
  SeatMap,
  type SeatMapCell,
  type SeatMapCellType,
} from '../../entities/seat-map.entity.js';
import { SeatMapType } from '../../enums/seat-map-type.enum.js';

/** Seat map as returned by /api/admin/seat-maps. `seatMap.company` must be loaded. */
export type AdminSeatMap = {
  id: string;
  company_uuid: string;
  company: PublicCompany;
  seat_map_code: string;
  name: string;
  layout_type: SeatMapType;
  floors: number;
  rows: number;
  columns: number;
  seats: SeatMapCell[];
  seat_count: number;
  note: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export function normalizeSeatMapCode(value: string) {
  return value.trim().toUpperCase();
}

export function normalizeSeatMapType(value: unknown) {
  const next = typeof value === 'string' ? value.trim() : '';
  return (Object.values(SeatMapType) as string[]).includes(next)
    ? (next as SeatMapType)
    : SeatMapType.Seat;
}

function defaultSeatCode(row: number, col: number) {
  return `${String.fromCharCode(64 + col)}${row}`;
}

function toPositiveInt(value: unknown, fallback: number) {
  const next = Number(value);
  return Number.isInteger(next) && next >= 1 ? next : fallback;
}

function toSeatType(value: unknown): SeatMapCellType {
  return value === 'empty' ? 'empty' : 'seat';
}

export function countSeats(seats: SeatMapCell[]) {
  return seats.filter((cell) => cell.type === 'seat').length;
}

/** Every cell of the grid: valid cells of `value` are kept, missing ones become default seats. */
export function normalizeSeats(
  value: unknown,
  floors: number,
  rows: number,
  columns: number,
): SeatMapCell[] {
  const previous = new Map<string, SeatMapCell>();
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const cell = item as Record<string, unknown>;
      const floor = toPositiveInt(cell.floor, 0);
      const row = toPositiveInt(cell.row, 0);
      const col = toPositiveInt(cell.col, 0);
      if (
        floor < 1 ||
        floor > floors ||
        row < 1 ||
        row > rows ||
        col < 1 ||
        col > columns
      ) {
        continue;
      }
      const type = toSeatType(cell.type);
      const code =
        typeof cell.code === 'string'
          ? cell.code.trim().toUpperCase()
          : defaultSeatCode(row, col);
      previous.set(`${floor}-${row}-${col}`, {
        floor,
        row,
        col,
        code: type === 'seat' ? code || defaultSeatCode(row, col) : '',
        type,
      });
    }
  }

  const seats: SeatMapCell[] = [];
  for (let floor = 1; floor <= floors; floor += 1) {
    for (let row = 1; row <= rows; row += 1) {
      for (let col = 1; col <= columns; col += 1) {
        seats.push(
          previous.get(`${floor}-${row}-${col}`) ?? {
            floor,
            row,
            col,
            code: defaultSeatCode(row, col),
            type: 'seat',
          },
        );
      }
    }
  }
  return seats;
}

export function toAdminSeatMap(seatMap: SeatMap): AdminSeatMap {
  const seats = normalizeSeats(
    seatMap.seats,
    seatMap.floors,
    seatMap.rows,
    seatMap.columns,
  );
  return {
    id: seatMap.uuid,
    company_uuid: seatMap.company.uuid,
    company: toPublicCompany(seatMap.company),
    seat_map_code: normalizeSeatMapCode(seatMap.seat_map_code),
    name: seatMap.name,
    layout_type: normalizeSeatMapType(seatMap.layout_type),
    floors: seatMap.floors,
    rows: seatMap.rows,
    columns: seatMap.columns,
    seats,
    seat_count: countSeats(seats),
    note: seatMap.note,
    is_active: seatMap.is_active,
    created_by: seatMap.created_by,
    updated_by: seatMap.updated_by,
    created_at: seatMap.created_at,
    updated_at: seatMap.updated_at,
  };
}
