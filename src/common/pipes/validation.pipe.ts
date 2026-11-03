import {
  BadRequestException,
  Injectable,
  ValidationPipe,
  type ValidationError,
} from '@nestjs/common';
import { ErrorMessage } from '../constants/error-message.constant.js';

@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = flattenValidationErrors(errors);
        return new BadRequestException({
          code: 'VALIDATION_FAILED',
          message: messages.length > 0 ? messages : ErrorMessage.VALIDATION_FAILED,
        });
      },
    });
  }
}

function flattenValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const current = error.constraints ? Object.values(error.constraints) : [];
    const nested = error.children?.length
      ? flattenValidationErrors(error.children)
      : [];
    return [...current, ...nested];
  });
}
