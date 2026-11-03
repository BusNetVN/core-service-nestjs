import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { map, Observable } from 'rxjs';
import {
  responseMeta,
  type ApiSuccessResponse,
} from '../http/api-response.js';

/** Wraps every successful handler result as { success, data, meta }; errors go through HttpExceptionFilter. */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<unknown>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((data: unknown) => ({
        success: true as const,
        data: data ?? null,
        meta: responseMeta(request, response),
      })),
    );
  }
}
