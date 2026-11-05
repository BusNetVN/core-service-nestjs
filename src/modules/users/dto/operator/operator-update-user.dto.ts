import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { STAFF_ROLE_VALUES } from '../../../../common/constants/account.constant.js';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

function uniqueValues({ value }: { value: unknown }) {
  return Array.isArray(value) ? [...new Set(value)] : value;
}

/**
 * Body of PATCH /api/operator/users/:id: missing or null fields keep their current value;
 * an empty password keeps the current one. Account type and company cannot be changed.
 */
export class OperatorUpdateUserDto {
  @Transform(trim)
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên đăng nhập.' })
  @MaxLength(64, { message: 'Tên đăng nhập tối đa 64 ký tự.' })
  @Matches(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/i, {
    message:
      'Tên đăng nhập chỉ gồm chữ thường, số, dấu chấm, gạch ngang hoặc gạch dưới.',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @Length(8, 72, { message: 'Mật khẩu phải từ 8 đến 72 ký tự.' })
  password?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Họ tên tối đa 255 ký tự.' })
  full_name?: string;

  @Transform(trim)
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @MaxLength(255, { message: 'Email tối đa 255 ký tự.' })
  email?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(32, { message: 'Số điện thoại tối đa 32 ký tự.' })
  phone?: string;

  @Transform(trimUpper)
  @IsOptional()
  @IsIn(['', ...STAFF_ROLE_VALUES], { message: 'Vai trò không hợp lệ.' })
  staff_role?: string | null;

  /** uuid of the roles (nhóm quyền) of the company; replaces the whole list. */
  @Transform(uniqueValues)
  @IsOptional()
  @IsArray({ message: 'Danh sách nhóm quyền không hợp lệ.' })
  @IsUUID('4', { each: true, message: 'Nhóm quyền không hợp lệ.' })
  role_ids?: string[];

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
