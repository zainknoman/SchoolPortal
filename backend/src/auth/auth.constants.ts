export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
export const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL ?? '15m';
export const REFRESH_TOKEN_TTL_DAYS = 30;
export const GENERIC_AUTH_ERROR = 'Invalid credentials';
export const ACCOUNT_LOCKED_ERROR =
  'Account temporarily locked. Try again later.';
