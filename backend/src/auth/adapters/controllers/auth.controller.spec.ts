import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { validateEnvironment } from '../../../../config/environment';

describe('Session configuration', () => {
  it.each(['development', 'production'])('sets cookie security for %s', async (mode) => {
    const config = { get: (key: string) => ({ NODE_ENV: mode, COOKIE_SAME_SITE: 'lax' })[key] };
    const login = { ejecutar: jest.fn().mockResolvedValue({ result: { accessToken: 'access' }, refreshToken: 'refresh' }) };
    const controller = new AuthController(login as never, {} as never, {} as never, config as ConfigService);
    const response = { cookie: jest.fn(), clearCookie: jest.fn() };
    await controller.login({ username: 'test', password: 'Password123!' }, response as unknown as Response);
    expect(response.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', expect.objectContaining({ httpOnly: true, secure: mode === 'production', path: '/auth/refresh' }));
    controller.logout(response as unknown as Response);
    expect(response.clearCookie.mock.calls[0]?.[1]).toEqual(response.cookie.mock.calls[0]?.[2]);
  });
  it('rejects missing or shared JWT secrets', () => {
    expect(() => validateEnvironment({})).toThrow('JWT_ACCESS_SECRET');
    expect(() => validateEnvironment({ JWT_ACCESS_SECRET: 'x'.repeat(48), JWT_REFRESH_SECRET: 'x'.repeat(48) })).toThrow('diferentes');
  });
  it('requires explicit production CORS and secure cross-site cookies', () => {
    const values = { JWT_ACCESS_SECRET: 'x'.repeat(48), JWT_REFRESH_SECRET: 'y'.repeat(48), DATABASE_URL: 'postgres://example/test' };
    expect(() => validateEnvironment({ ...values, NODE_ENV: 'production' })).toThrow('CORS_ORIGINS');
    expect(() => validateEnvironment({ ...values, COOKIE_SAME_SITE: 'none', COOKIE_SECURE: 'false' })).toThrow('COOKIE_SECURE');
  });
});
