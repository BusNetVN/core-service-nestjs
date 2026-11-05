import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SeatMapType } from '../../enums/seat-map-type.enum.js';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

function toInt({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const next = Number(value);
  return Number.isFinite(next) ? next : value;
}

/**
 * Body of POST /api/operator/seat-maps. The company always comes from the access token
 * (sending company_uuid -> 400).
 */
export class OperatorCreateSeatMapDto {
  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã sơ đồ.' })
  @MaxLength(32)
  seat_map_code: string;

  /** Falls back to the code when empty. */
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(180)
  name?: string;

  @IsOptional()
  @IsEnum(SeatMapType)
  layout_type?: SeatMapType;

  @Transform(toInt)
  @IsOptional()
  @IsInt()
  floors?: number;

  @Transform(toInt)
  @IsOptional()
  @IsInt()
  rows?: number;

  @Transform(toInt)
  @IsOptional()
  @IsInt()
  columns?: number;

  /** Cells { floor, row, col, code, type }; cells outside the grid are dropped. */
  @IsOptional()
  @IsArray()
  seats?: unknown[];

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái không hợp lệ.' })
  is_active?: boolean;
}
