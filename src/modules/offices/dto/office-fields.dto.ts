import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
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

/** Office fields shared by the admin and operator DTOs; the company is added (or not) by each side. */
export class OfficeFieldsDto {
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
}
