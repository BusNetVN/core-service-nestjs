import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { HttpExceptionFilter } from './filters/http-exception.filter.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { LoggingInterceptor } from './interceptors/logging.interceptor.js';
import { ResponseEnvelopeInterceptor } from './interceptors/response-envelope.interceptor.js';
import { AppValidationPipe } from './pipes/validation.pipe.js';
import { TokenService } from './services/token.service.js';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    TokenService,
    AccessTokenGuard,
    PermissionsGuard,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_PIPE,
      useClass: AppValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
  ],
  exports: [TokenService],
})
export class CommonModule {}
