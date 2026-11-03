import { HttpStatus } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { ErrorMessage } from '../constants/error-message.constant.js';
import { errorResponse } from '../http/api-response.js';

// Set by nginx (proxy_set_header); requests that bypass nginx do not have it.
export const GATEWAY_TOKEN_HEADER = 'x-bnv-gateway-token';

export function gatewayOnly(token: string) {
  const expected = Buffer.from(token);

  return (request: Request, response: Response, next: NextFunction) => {
    const received = Buffer.from(request.get(GATEWAY_TOKEN_HEADER) ?? '');
    if (received.length === expected.length && timingSafeEqual(received, expected)) {
      next();
      return;
    }

    response
      .status(HttpStatus.FORBIDDEN)
      .json(errorResponse('GATEWAY_ONLY', ErrorMessage.GATEWAY_ONLY));
  };
}
