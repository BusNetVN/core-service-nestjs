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

/** Body of POST /api/admin/permission-groups/:id/permissions. */
export class AdminCreatePermissionDto {
  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã chức năng.' })
  @MaxLength(64, { message: 'Mã chức năng tối đa 64 ký tự.' })
  @Matches(/^[A-Z][A-Z0-9]*(?:[_-][A-Z0-9]+)*$/, {
    message: 'Mã chức năng chỉ gồm chữ hoa, số, gạch ngang hoặc gạch dưới.',
  })
  code: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên chức năng.' })
  @MaxLength(120, { message: 'Tên chức năng tối đa 120 ký tự.' })
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
}
