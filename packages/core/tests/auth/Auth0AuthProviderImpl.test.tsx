import { render } from '@testing-library/react';
import { Auth0AuthProviderImpl } from '@/context/auth/Auth0AuthProviderImpl';
import { AuthContext } from '@/context/auth/AuthContext';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({
    user: { name: 'John Doe', email: 'john@example.com' },
    isLoading: false,
  }),
}));

describe('Auth0AuthProviderImpl', () => {
  it('maps user and provides context', () => {
    let context: any;
    render(
      <Auth0AuthProviderImpl>
        <AuthContext.Consumer>
          {ctx => {
            context = ctx;
            return null;
          }}
        </AuthContext.Consumer>
      </Auth0AuthProviderImpl>
    );

    expect(context?.user).toEqual(expect.objectContaining({ email: 'john@example.com' }));
    expect(context?.loading).toBe(false);
    expect(context?.isAuthenticated).toBe(true);
  });

  it('login redirects to /api/auth/login', async () => {
    // @ts-expect-error override location for test
    delete window.location;
    // @ts-expect-error override location for test
    window.location = { href: '' };

    let ctx: any;
    render(
      <Auth0AuthProviderImpl>
        <AuthContext.Consumer>
          {c => {
            ctx = c;
            return null;
          }}
        </AuthContext.Consumer>
      </Auth0AuthProviderImpl>
    );

    await ctx?.login();
    expect(window.location.href).toBe('/api/auth/login');
  });

  it('logout redirects to /api/auth/logout', async () => {
    // @ts-expect-error override location for test
    delete window.location;
    // @ts-expect-error override location for test
    window.location = { href: '' };

    let ctx: any;
    render(
      <Auth0AuthProviderImpl>
        <AuthContext.Consumer>
          {c => {
            ctx = c;
            return null;
          }}
        </AuthContext.Consumer>
      </Auth0AuthProviderImpl>
    );

    await ctx?.logout();
    expect(window.location.href).toBe('/api/auth/logout');
  });
});
