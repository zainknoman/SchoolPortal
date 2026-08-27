import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function makeContext(
  role: string | undefined,
  requiredRoles: string[] | undefined,
) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;
  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { id: 'u1', role } : undefined }),
    }),
  } as unknown as ExecutionContext;
  return { reflector, context };
}

describe('RolesGuard', () => {
  it('allows the request when no @Roles metadata is set on the route (public within auth)', () => {
    const { reflector, context } = makeContext('PARENT', undefined);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows the request when the user role is in the required list', () => {
    const { reflector, context } = makeContext('TEACHER', [
      'TEACHER',
      'SCHOOL_ADMIN',
    ]);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a PARENT-role token calling an admin-only route (403, not a hidden button)', () => {
    const { reflector, context } = makeContext('PARENT', [
      'SCHOOL_ADMIN',
      'SUPER_ADMIN',
    ]);
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow();
  });

  it('denies a request with no authenticated user at all when roles are required', () => {
    const { reflector, context } = makeContext(undefined, ['TEACHER']);
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow();
  });
});
