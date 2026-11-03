import { QueryFailedError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

function sqlState(error: unknown) {
  if (!(error instanceof QueryFailedError)) {
    return undefined;
  }
  return (error.driverError as { code?: string } | undefined)?.code;
}

export function isForeignKeyViolation(error: unknown) {
  return sqlState(error) === FOREIGN_KEY_VIOLATION;
}

export function isIntegrityViolation(error: unknown) {
  const state = sqlState(error);
  return state === UNIQUE_VIOLATION || state === FOREIGN_KEY_VIOLATION;
}
