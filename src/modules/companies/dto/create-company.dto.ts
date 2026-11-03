import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { BusinessType } from '../enums/business-type.enum.js';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimLower({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreateCompanyDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên nhà xe.' })
  @MaxLength(255)
  name: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  short_name?: string;

  @Transform(trimLower)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã công ty.' })
  @MaxLength(32)
  company_code: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập slug.' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.',
  })
  @MaxLength(180)
  slug: string;

  @Transform(trim)
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsUrl({ require_protocol: true }, { message: 'URL logo không hợp lệ.' })
  logo_url?: string;

  @Transform(trim)
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsUrl({ require_protocol: true }, { message: 'URL ảnh bìa không hợp lệ.' })
  cover_image_url?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  description?: string;

  @Transform(trimUpper)
  @IsEnum(BusinessType, { message: 'Loại hình không hợp lệ.' })
  business_type: BusinessType;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(32)
  tax_code?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_license_no?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  legal_representative?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(32)
  representative_phone?: string;

  @Transform(trim)
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @Transform(trim)
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsUrl(
    { require_protocol: true },
    { message: 'Website phải bắt đầu bằng http:// hoặc https://.' },
  )
  website?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
