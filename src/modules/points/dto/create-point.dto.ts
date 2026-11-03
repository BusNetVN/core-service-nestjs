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
import { POINT_TYPE_VALUES } from '../enums/point-type.enum.js';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreatePointDto {
  @IsOptional()
  @IsUUID('4', { message: 'Nhà xe không hợp lệ.' })
  company_uuid?: string;

  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã điểm dừng.' })
  @MaxLength(32)
  point_code: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên điểm dừng.' })
  @MaxLength(180)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn loại điểm.' })
  @IsIn(POINT_TYPE_VALUES, { message: 'Loại điểm không hợp lệ.' })
  point_type: string;

  @IsOptional()
  @IsUUID('4', { message: 'Tỉnh/thành phố không hợp lệ.' })
  province_uuid?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Xã/phường không hợp lệ.' })
  ward_uuid?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsArray({ message: 'Danh sách nhà xe không hợp lệ.' })
  @ArrayUnique({ message: 'Danh sách nhà xe bị trùng.' })
  @IsUUID('4', { each: true, message: 'Nhà xe không hợp lệ.' })
  allowed_company_uuids?: string[];
}
