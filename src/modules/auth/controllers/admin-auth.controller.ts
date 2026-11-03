import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../../common/decorators/public.decorator.js';
import { AdminLoginDto } from '../dto/admin/admin-login.dto.js';
import { AdminRefreshTokenDto } from '../dto/admin/admin-refresh-token.dto.js';
import { AdminLoginUseCase } from '../usecases/admin/admin-login.usecase.js';
import { AdminLogoutUseCase } from '../usecases/admin/admin-logout.usecase.js';
import { AdminRefreshTokenUseCase } from '../usecases/admin/admin-refresh-token.usecase.js';
import { clientInfo } from '../utils/admin/admin-session-token.js';

/** Đăng nhập cho trang quản trị (bnv-admin), prefix: /api/admin/auth. Chỉ tài khoản SYSTEM_ADMIN. */
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminLogin: AdminLoginUseCase,
    private readonly refreshToken: AdminRefreshTokenUseCase,
    private readonly logoutSession: AdminLogoutUseCase,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto, @Req() request: Request) {
    return this.adminLogin.execute(dto, clientInfo(request));
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: AdminRefreshTokenDto) {
    return this.refreshToken.execute(dto);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: AdminRefreshTokenDto) {
    await this.logoutSession.execute(dto);
  }
}
