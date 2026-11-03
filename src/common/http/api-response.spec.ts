import {
  ArgumentsHost,
  BadRequestException,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { lastValueFrom, of } from 'rxjs';
import { HttpExceptionFilter } from '../filters/http-exception.filter.js';
import { ResponseEnvelopeInterceptor } from '../interceptors/response-envelope.interceptor.js';
import { requestContext } from './api-response.js';

function httpPair(requestId?: string) {
  const request = {
    method: 'POST',
    originalUrl: '/api/operator/auth/login?debug=1',
    get: (name: string) => (name === 'x-request-id' ? requestId : undefined),
  } as unknown as Request;
  const response = {
    locals: {},
    headers: {} as Record<string, string>,
    statusCode: 200,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json: vi.fn(),
  };
  requestContext()(request, response as unknown as Response, () => undefined);
  return { request, response };
}

function host(request: Request, response: unknown) {
  const http = { getRequest: () => request, getResponse: () => response };
  return { switchToHttp: () => http } as unknown as ExecutionContext & ArgumentsHost;
}

describe('API response envelope', () => {
  it('wraps a handler result with success, data and meta', async () => {
    const { request, response } = httpPair('req-123');

    const body = await lastValueFrom(
      new ResponseEnvelopeInterceptor().intercept(host(request, response), {
        handle: () => of({ id: 'abc' }),
      }),
    );

    expect(body).toEqual({
      success: true,
      data: { id: 'abc' },
      meta: {
        request_id: 'req-123',
        latency_ms: expect.any(Number),
        endpoint: 'POST /api/operator/auth/login',
        timestamp: expect.any(String),
      },
    });
    expect(response.headers['X-Request-Id']).toBe('req-123');
  });

  it('generates a request id and returns null data for empty results', async () => {
    const { request, response } = httpPair();

    const body = await lastValueFrom(
      new ResponseEnvelopeInterceptor().intercept(host(request, response), {
        handle: () => of(undefined),
      }),
    );

    expect(body.data).toBeNull();
    expect(body.meta.request_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('returns errors as { success: false, error: { code, message } }', () => {
    const { request, response } = httpPair('req-err');

    new HttpExceptionFilter().catch(
      new UnauthorizedException('Thiếu access token.'),
      host(request, response),
    );

    expect(response.statusCode).toBe(401);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Thiếu access token.' },
    });
  });

  it('uses the code given by the exception and joins validation messages', () => {
    const { request, response } = httpPair();

    new HttpExceptionFilter().catch(
      new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: ['Vui lòng nhập tên đăng nhập.', 'Vui lòng nhập mật khẩu.'],
      }),
      host(request, response),
    );

    expect(response.statusCode).toBe(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng nhập tên đăng nhập. Vui lòng nhập mật khẩu.',
      },
    });
  });

  it('hides unexpected errors behind INTERNAL_SERVER_ERROR', () => {
    const { request, response } = httpPair();

    new HttpExceptionFilter().catch(new Error('db down'), host(request, response));

    expect(response.statusCode).toBe(500);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Hệ thống đang gặp sự cố. Vui lòng thử lại.',
      },
    });
  });
});
