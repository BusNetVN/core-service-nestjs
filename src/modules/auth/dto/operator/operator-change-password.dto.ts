import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

/** Body of POST /api/operator/auth/change-password. */
export class OperatorChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại.' })
  @MaxLength(72, { message: 'Mật khẩu tối đa 72 ký tự.' })
  current_password: string;

  @IsString()
  @Length(8, 72, { message: 'Mật khẩu mới phải từ 8 đến 72 ký tự.' })
  new_password: string;
}
