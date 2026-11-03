import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { AdminCreateUserDto } from './admin-create-user.dto.js';

/** Partial update: missing or null fields keep their current value; an empty password keeps the current one. */
export class AdminUpdateUserDto extends PartialType(
  OmitType(AdminCreateUserDto, ['password'] as const),
) {
  @IsOptional()
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @Length(8, 72, { message: 'Mật khẩu phải từ 8 đến 72 ký tự.' })
  password?: string;
}
