import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { POINT_TYPE_VALUES } from '../../enums/point-type.enum.js';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

/**
 * Admins create shared points (scope SYSTEM), so there is no company_uuid.
 * The code has no character pattern because existing codes contain Vietnamese
 * letters (e.g. "BXMĐ").
 */
export class AdminCreatePointDto {
  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã điểm dừng.' })
  @MaxLength(32, { message: 'Mã điểm dừng tối đa 32 ký tự.' })
  point_code: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên điểm dừng.' })
  @MaxLength(180, { message: 'Tên điểm dừng tối đa 180 ký tự.' })
  name: string;

  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn loại điểm.' })
  @IsIn(POINT_TYPE_VALUES, { message: 'Loại điểm không hợp lệ.' })
  point_type: string;

  @IsOptional()
  @IsUUID('4', { message: 'Tỉnh/thành phố không hợp lệ.' })
  province_uuid?: string;

  /** When given, its province is used (and must match province_uuid if both are sent). */
  @IsOptional()
  @IsUUID('4', { message: 'Xã/phường không hợp lệ.' })
  ward_uuid?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Địa chỉ tối đa 500 ký tự.' })
  address?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Ghi chú tối đa 1000 ký tự.' })
  note?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  /** Companies allowed to use the point; an empty list means every company. */
  @IsOptional()
  @IsArray({ message: 'Danh sách nhà xe không hợp lệ.' })
  @ArrayUnique({ message: 'Danh sách nhà xe bị trùng.' })
  @IsUUID('4', { each: true, message: 'Nhà xe không hợp lệ.' })
  allowed_company_uuids?: string[];
}
