import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';
const REQUEST_ID_MAX_LENGTH = 128;

export type ResponseMeta = {
  request_id: string;
  latency_ms: number;
  endpoint: string;
  timestamp: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: ResponseMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    /** Machine-readable, e.g. "NOT_FOUND", "VALIDATION_FAILED"; the HTTP status carries the number. */
    code: string;
    message: string;
  };
};

type RequestContext = {
  requestId: string;
  startedAt: number;
};

/**
 * First middleware of the app: gives every request an id (the client's X-Request-Id when it
 * sends a sane one) and a start time, so success and error responses can both build `meta`.
 */
export function requestContext() {
  return (request: Request, response: Response, next: NextFunction) => {
    const received = request.get(REQUEST_ID_HEADER)?.trim();
    const requestId =
      received && received.length <= REQUEST_ID_MAX_LENGTH ? received : randomUUID();
    const context: RequestContext = { requestId, startedAt: performance.now() };
    response.locals.requestContext = context;
    response.setHeader('X-Request-Id', requestId);
    next();
  };
}

export function responseMeta(request: Request, response: Response): ResponseMeta {
  const context = response.locals.requestContext as RequestContext | undefined;
  const path = (request.originalUrl ?? request.url).split('?')[0];
  return {
    request_id: context?.requestId ?? randomUUID(),
    latency_ms: context
      ? Math.round((performance.now() - context.startedAt) * 100) / 100
      : 0,
    endpoint: `${request.method} ${path}`,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(code: string, message: string): ApiErrorResponse {
  return { success: false, error: { code, message } };
}
