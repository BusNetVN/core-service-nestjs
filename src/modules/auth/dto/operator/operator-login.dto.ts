import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Body of POST /api/operator/auth/login. */
export class OperatorLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên đăng nhập.' })
  @MaxLength(64, { message: 'Tên đăng nhập tối đa 64 ký tự.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu.' })
  @MaxLength(72, { message: 'Mật khẩu tối đa 72 ký tự.' })
  password: string;
}
