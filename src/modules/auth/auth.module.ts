import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module.js';
import { UsersModule } from '../users/users.module.js';
import { AdminAuthController } from './controllers/admin-auth.controller.js';
import { OperatorAuthController } from './controllers/operator-auth.controller.js';
import { AuthSession } from './entities/auth-session.entity.js';
import { AuthSessionRepository } from './repository/auth-session.repository.js';
import { AdminLoginUseCase } from './usecases/admin-login.usecase.js';
import { ChangePasswordUseCase } from './usecases/change-password.usecase.js';
import { LogoutUseCase } from './usecases/logout.usecase.js';
import { OperatorAccessLoader } from './usecases/operator-access.js';
import { OperatorLoginUseCase } from './usecases/operator-login.usecase.js';
import { OperatorRefreshTokenUseCase } from './usecases/operator-refresh-token.usecase.js';
import { RefreshTokenUseCase } from './usecases/refresh-token.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuthSession]), CommonModule, UsersModule],
  controllers: [AdminAuthController, OperatorAuthController],
  providers: [
    AuthSessionRepository,
    AdminLoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    OperatorAccessLoader,
    OperatorLoginUseCase,
    OperatorRefreshTokenUseCase,
    ChangePasswordUseCase,
  ],
})
export class AuthModule {}
