import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const CATALOG_CODE_PATTERN = /^[A-Z][A-Z0-9]*(?:[_-][A-Z0-9]+)*$/;
export const SORT_ORDER_MESSAGE = 'Thứ tự phải từ 0 đến 9999.';

export function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

export function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreatePermissionGroupDto {
  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã nhóm chức năng.' })
  @MaxLength(64, { message: 'Mã nhóm tối đa 64 ký tự.' })
  @Matches(CATALOG_CODE_PATTERN, {
    message: 'Mã nhóm chỉ gồm chữ hoa, số, gạch ngang hoặc gạch dưới.',
  })
  code: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên nhóm chức năng.' })
  @MaxLength(120, { message: 'Tên nhóm tối đa 120 ký tự.' })
  name: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Mô tả tối đa 500 ký tự.' })
  description?: string;

  @IsOptional()
  @IsInt({ message: SORT_ORDER_MESSAGE })
  @Min(0, { message: SORT_ORDER_MESSAGE })
  @Max(9999, { message: SORT_ORDER_MESSAGE })
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  seed_standard_permissions?: boolean;
}
