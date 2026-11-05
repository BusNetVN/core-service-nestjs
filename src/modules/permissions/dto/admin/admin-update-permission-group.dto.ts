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

const SORT_ORDER_MESSAGE = 'Thứ tự phải từ 0 đến 9999.';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

/** Body of PATCH /api/admin/permission-groups/:id: every field is optional, missing ones are kept. */
export class AdminUpdatePermissionGroupDto {
  @Transform(trimUpper)
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã nhóm chức năng.' })
  @MaxLength(64, { message: 'Mã nhóm tối đa 64 ký tự.' })
  @Matches(/^[A-Z][A-Z0-9]*(?:[_-][A-Z0-9]+)*$/, {
    message: 'Mã nhóm chỉ gồm chữ hoa, số, gạch ngang hoặc gạch dưới.',
  })
  code?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên nhóm chức năng.' })
  @MaxLength(120, { message: 'Tên nhóm tối đa 120 ký tự.' })
  name?: string;

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
}
