import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Body of POST /api/admin/auth/refresh and /api/admin/auth/logout. */
export class AdminRefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng gửi refresh token.' })
  @MaxLength(4096, { message: 'Refresh token không hợp lệ.' })
  refresh_token: string;
}
