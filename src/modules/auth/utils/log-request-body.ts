const SECRET_FIELDS = new Set([
  'password',
  'current_password',
  'new_password',
  'refresh_token',
]);

/** Prints the body an operator auth API received; passwords and tokens are masked. */
export function logRequestBody(endpoint: string, body: object) {
  const masked = Object.fromEntries(
    Object.entries(body).map(([field, value]) => [
      field,
      SECRET_FIELDS.has(field) ? '***' : value,
    ]),
  );
  console.log(`[${endpoint}]`, masked);
}
