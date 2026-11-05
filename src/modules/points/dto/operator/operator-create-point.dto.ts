import { Transform } from 'class-transformer';
import {
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
 * Body of POST /api/operator/points: a point of the company in the access token (scope
 * COMPANY). Sending company_uuid or allowed_company_uuids -> 400.
 */
export class OperatorCreatePointDto {
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
  @IsBoolean({ message: 'Trạng thái không hợp lệ.' })
  is_active?: boolean;
}
