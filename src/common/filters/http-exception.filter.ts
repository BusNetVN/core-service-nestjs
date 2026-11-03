import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ErrorMessage } from '../constants/error-message.constant.js';
import { errorResponse } from '../http/api-response.js';
import { isIntegrityViolation } from '../utils/database-error.js';

type ResolvedError = {
  status: number;
  code: string;
  message: string;
};

/** "NOT_FOUND" for 404 and so on; HttpStatus is a numeric enum, so it maps back to its name. */
function statusCode(status: number) {
  return (HttpStatus as unknown as Record<number, string | undefined>)[status] ?? 'ERROR';
}

/** Validation errors arrive as one message per field; the response carries a single string. */
function joinMessage(message: unknown, fallback: string) {
  if (Array.isArray(message)) {
    const parts = message.filter(
      (item): item is string => typeof item === 'string' && item.length > 0,
    );
    return parts.length > 0 ? parts.join(' ') : fallback;
  }
  return typeof message === 'string' && message ? message : fallback;
}

/**
 * Every error becomes { success: false, error: { code, message } } with the matching HTTP
 * status. An exception can choose its code by passing { code, message } as its response.
 */
@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const error = this.resolve(exception, request);

    if (error.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl} ${error.status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response
      .status(error.status)
      .json(errorResponse(error.code, error.message));
  }

  private resolve(exception: unknown, request: Request): ResolvedError {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const record =
        payload && typeof payload === 'object'
          ? (payload as { code?: unknown; message?: unknown })
          : { message: payload };

      return {
        status,
        code:
          typeof record.code === 'string' && record.code
            ? record.code
            : statusCode(status),
        message: joinMessage(record.message, exception.message),
      };
    }

    if (exception instanceof QueryFailedError && isIntegrityViolation(exception)) {
      this.logger.warn(
        `${request.method} ${request.originalUrl} 409 ${exception.message}`,
      );
      return {
        status: HttpStatus.CONFLICT,
        code: 'DATA_CONFLICT',
        message: ErrorMessage.DATA_CONFLICT,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: statusCode(HttpStatus.INTERNAL_SERVER_ERROR),
      message: ErrorMessage.INTERNAL_ERROR,
    };
  }
}
