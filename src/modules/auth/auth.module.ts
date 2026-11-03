import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module.js';
import { UsersModule } from '../users/users.module.js';
import { AdminAuthController } from './controllers/admin-auth.controller.js';
import { OperatorAuthController } from './controllers/operator-auth.controller.js';
import { AuthSession } from './entities/auth-session.entity.js';
import { AdminAuthSessionRepository } from './repository/admin/admin-auth-session.repository.js';
import { OperatorAuthSessionRepository } from './repository/operator/operator-auth-session.repository.js';
import { AdminLoginUseCase } from './usecases/admin/admin-login.usecase.js';
import { AdminLogoutUseCase } from './usecases/admin/admin-logout.usecase.js';
import { AdminRefreshTokenUseCase } from './usecases/admin/admin-refresh-token.usecase.js';
import { OperatorAccessLoader } from './usecases/operator/operator-access.js';
import { OperatorChangePasswordUseCase } from './usecases/operator/operator-change-password.usecase.js';
import { OperatorLoginUseCase } from './usecases/operator/operator-login.usecase.js';
import { OperatorLogoutUseCase } from './usecases/operator/operator-logout.usecase.js';
import { OperatorRefreshTokenUseCase } from './usecases/operator/operator-refresh-token.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuthSession]), CommonModule, UsersModule],
  controllers: [AdminAuthController, OperatorAuthController],
  providers: [
    AdminAuthSessionRepository,
    AdminLoginUseCase,
    AdminRefreshTokenUseCase,
    AdminLogoutUseCase,
    OperatorAuthSessionRepository,
    OperatorAccessLoader,
    OperatorLoginUseCase,
    OperatorRefreshTokenUseCase,
    OperatorLogoutUseCase,
    OperatorChangePasswordUseCase,
  ],
})
export class AuthModule {}
