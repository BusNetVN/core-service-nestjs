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
import {
  CATALOG_CODE_PATTERN,
  SORT_ORDER_MESSAGE,
  trim,
  trimUpper,
} from './create-permission-group.dto.js';

export class CreatePermissionDto {
  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã chức năng.' })
  @MaxLength(64, { message: 'Mã chức năng tối đa 64 ký tự.' })
  @Matches(CATALOG_CODE_PATTERN, {
    message:
      'Mã chức năng chỉ gồm chữ hoa, số, gạch ngang hoặc gạch dưới.',
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
