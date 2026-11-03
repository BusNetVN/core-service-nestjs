import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    const { method, originalUrl } = request;
    const requestId = response.getHeader('X-Request-Id') ?? '-';

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `${method} ${originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms [${requestId}]`,
          );
        },
        error: (error: { status?: number }) => {
          this.logger.warn(
            `${method} ${originalUrl} ${error?.status ?? 500} ${Date.now() - startedAt}ms [${requestId}]`,
          );
        },
      }),
    );
  }
}
