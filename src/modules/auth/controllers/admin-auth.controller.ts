import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../../common/decorators/public.decorator.js';
import { AdminLoginDto } from '../dto/admin-login.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { AdminLoginUseCase } from '../usecases/admin-login.usecase.js';
import { LogoutUseCase } from '../usecases/logout.usecase.js';
import { RefreshTokenUseCase } from '../usecases/refresh-token.usecase.js';
import { clientInfo } from '../utils/session-token.js';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminLogin: AdminLoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logoutSession: LogoutUseCase,
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
  refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshToken.execute(dto);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.logoutSession.execute(dto);
  }
}
