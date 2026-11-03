import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng gửi refresh token.' })
  @MaxLength(4096, { message: 'Refresh token không hợp lệ.' })
  refresh_token: string;
}
