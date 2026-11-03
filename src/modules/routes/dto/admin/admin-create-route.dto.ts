import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const MAX_DISTANCE_KM = 10_000;
/** One week. */
const MAX_DURATION_MINUTES = 10_080;

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

function emptyToNull({ value }: { value: unknown }) {
  return value === '' ? null : value;
}

/**
 * Stricter than CreateRouteDto: code, origin and destination are required and the
 * numbers are bounded. The code has no character pattern because existing codes
 * contain Vietnamese letters and spaces (e.g. "SG-ĐN").
 */
export class AdminCreateRouteDto {
  @IsUUID('4', { message: 'Nhà xe không hợp lệ.' })
  company_uuid: string;

  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã tuyến.' })
  @MaxLength(32, { message: 'Mã tuyến tối đa 32 ký tự.' })
  route_code: string;

  /** Defaults to "<origin> - <destination>" when empty. */
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(180, { message: 'Tên tuyến tối đa 180 ký tự.' })
  name?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập điểm đi.' })
  @MaxLength(180, { message: 'Điểm đi tối đa 180 ký tự.' })
  origin: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập điểm đến.' })
  @MaxLength(180, { message: 'Điểm đến tối đa 180 ký tự.' })
  destination: string;

  @Transform(emptyToNull)
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt({ message: 'Khoảng cách phải là số nguyên (km).' })
  @Min(1, { message: `Khoảng cách phải từ 1 đến ${MAX_DISTANCE_KM} km.` })
  @Max(MAX_DISTANCE_KM, {
    message: `Khoảng cách phải từ 1 đến ${MAX_DISTANCE_KM} km.`,
  })
  distance_km?: number | null;

  @Transform(emptyToNull)
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt({ message: 'Thời gian chạy phải là số nguyên (phút).' })
  @Min(1, {
    message: `Thời gian chạy phải từ 1 đến ${MAX_DURATION_MINUTES} phút.`,
  })
  @Max(MAX_DURATION_MINUTES, {
    message: `Thời gian chạy phải từ 1 đến ${MAX_DURATION_MINUTES} phút.`,
  })
  duration_minutes?: number | null;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Ghi chú tối đa 1000 ký tự.' })
  note?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
