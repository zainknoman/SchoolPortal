import type { StringValue } from 'ms';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
// JWT_ACCESS_TTL is developer-set config (.env), not user input — asserting the `ms`-compatible
// literal shape here is safe; an invalid value would fail fast at JwtModule.register() either way.
export const ACCESS_TOKEN_TTL = (process.env.JWT_ACCESS_TTL ??
  '15m') as StringValue;
export const REFRESH_TOKEN_TTL_DAYS = 30;
export const GENERIC_AUTH_ERROR = 'Invalid credentials';
export const ACCOUNT_LOCKED_ERROR =
  'Account temporarily locked. Try again later.';
