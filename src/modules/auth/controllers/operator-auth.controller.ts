import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { OperatorLoginDto } from '../dto/operator-login.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { ChangePasswordUseCase } from '../usecases/change-password.usecase.js';
import { LogoutUseCase } from '../usecases/logout.usecase.js';
import { OperatorLoginUseCase } from '../usecases/operator-login.usecase.js';
import { OperatorRefreshTokenUseCase } from '../usecases/operator-refresh-token.usecase.js';
import { logRequestBody } from '../utils/log-request-body.js';
import { clientInfo } from '../utils/session-token.js';

/**
 * Đăng nhập cho hệ thống vận hành nhà xe (bnv-operator), prefix: /api/operator/auth.
 *
 * - Chỉ tài khoản COMPANY_STAFF đang hoạt động, thuộc một nhà xe đang hoạt động, được đăng nhập.
 * - Kết quả login/refresh: access_token, refresh_token, token_type, expires_in và account
 *   (PublicUser kèm roles và permissions). permissions là mọi mã chức năng tài khoản được
 *   dùng (từ nhóm quyền đang hoạt động + quyền mặc định theo staff_role), đã chuẩn hóa dạng
 *   "ROUTE_UPDATE".
 * - Access token mang mã chức năng của các nhóm quyền; đổi nhóm quyền có hiệu lực từ lần
 *   refresh hoặc đăng nhập tiếp theo.
 */
@Controller('operator/auth')
export class OperatorAuthController {
  constructor(
    private readonly operatorLogin: OperatorLoginUseCase,
    private readonly refreshToken: OperatorRefreshTokenUseCase,
    private readonly logoutSession: LogoutUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  /**
   * POST /api/operator/auth/login
   * Vào: { username, password }.
   * Lỗi: 401 sai tên đăng nhập hoặc mật khẩu; 403 tài khoản bị khóa, không phải nhân viên
   *      nhà xe, chưa gắn nhà xe hoặc nhà xe ngừng hoạt động.
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: OperatorLoginDto, @Req() request: Request) {
    logRequestBody('POST /api/operator/auth/login', dto);
    return this.operatorLogin.execute(dto, clientInfo(request));
  }

  /**
   * POST /api/operator/auth/refresh
   * Vào: { refresh_token }. Mỗi refresh token chỉ dùng được một lần.
   * Lỗi: 401 phiên không hợp lệ/hết hạn; 403 tài khoản không còn được dùng hệ thống vận hành
   *      (phiên bị thu hồi).
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    logRequestBody('POST /api/operator/auth/refresh', dto);
    return this.refreshToken.execute(dto);
  }

  /**
   * POST /api/operator/auth/logout
   * Vào: { refresh_token }. Thu hồi phiên; token không hợp lệ thì bỏ qua. Ra: 204.
   */
  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto) {
    logRequestBody('POST /api/operator/auth/logout', dto);
    await this.logoutSession.execute(dto);
  }

  /**
   * POST /api/operator/auth/change-password
   * Tài khoản đang đăng nhập (access token) tự đổi mật khẩu. Ra: 204.
   * Vào: { current_password, new_password (8-72 ký tự) }.
   * Lỗi: 400 mật khẩu hiện tại sai hoặc mật khẩu mới trùng mật khẩu cũ; 401 thiếu token.
   */
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    logRequestBody('POST /api/operator/auth/change-password', {
      username: user.username,
      ...dto,
    });
    await this.changePasswordUseCase.execute(user.sub, dto);
  }
}
