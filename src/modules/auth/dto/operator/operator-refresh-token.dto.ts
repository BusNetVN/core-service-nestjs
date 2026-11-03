import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Body of POST /api/operator/auth/refresh and /api/operator/auth/logout. */
export class OperatorRefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng gửi refresh token.' })
  @MaxLength(4096, { message: 'Refresh token không hợp lệ.' })
  refresh_token: string;
}
