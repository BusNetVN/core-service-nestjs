import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

function uniquePhones({ value }: { value: unknown }) {
  const list = Array.isArray(value) ? value : [];
  return [
    ...new Set(
      list
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean),
    ),
  ];
}

/**
 * Body of POST /api/operator/offices. The company always comes from the access token
 * (sending company_uuid -> 400).
 */
export class OperatorCreateOfficeDto {
  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã văn phòng.' })
  @Matches(/^[A-Z0-9]+(?:[._-]?[A-Z0-9]+)*$/, {
    message:
      'Mã văn phòng chỉ gồm chữ in hoa, số, dấu chấm, gạch ngang hoặc gạch dưới.',
  })
  @MaxLength(32)
  office_code: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên văn phòng.' })
  @MaxLength(180)
  name: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ văn phòng.' })
  @MaxLength(500)
  address: string;

  @Transform(uniquePhones)
  @IsArray({ message: 'Danh sách số điện thoại không hợp lệ.' })
  @ArrayMinSize(1, { message: 'Vui lòng nhập ít nhất một số điện thoại.' })
  @IsString({ each: true, message: 'Số điện thoại không hợp lệ.' })
  @MaxLength(20, { each: true, message: 'Số điện thoại tối đa 20 ký tự.' })
  phones: string[];

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái không hợp lệ.' })
  is_active?: boolean;
}
