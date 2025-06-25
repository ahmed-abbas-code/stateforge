/// <reference types="vitest" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnifiedAuthStrategySelector } from '@/context/auth/UnifiedAuthStrategySelector';

// ─── Mock config to override AUTH_STRATEGY directly ───────────────
vi.mock('@/lib/config', () => ({
  config: {
    AUTH_STRATEGY: 'auth0',
  },
}));

// ─── Mock Auth Providers ──────────────────────────────────────────
vi.mock('@/context/auth/Auth0AuthProviderImpl', () => ({
  Auth0AuthProviderImpl: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth0">{children}</div>
  ),
}));

vi.mock('@/context/auth/FirebaseAuthProviderImpl', () => ({
  FirebaseAuthProviderImpl: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="firebase">{children}</div>
  ),
}));

describe('UnifiedAuthStrategySelector', () => {
  it('renders Auth0 provider when AUTH_STRATEGY is "auth0"', () => {
    render(
      <UnifiedAuthStrategySelector>
        <div>Child</div>
      </UnifiedAuthStrategySelector>
    );
    expect(screen.getByTestId('auth0')).toBeDefined();
    // Optionally, if jest-dom is used:
    // expect(screen.getByTestId('auth0')).toBeInTheDocument();
  });

  it('renders Firebase provider when AUTH_STRATEGY is "firebase"', () => {
    const mockConfig = require('@/lib/config');
    mockConfig.config.AUTH_STRATEGY = 'firebase';

    render(
      <UnifiedAuthStrategySelector>
        <div>Child</div>
      </UnifiedAuthStrategySelector>
    );
    expect(screen.getByTestId('firebase')).toBeDefined();
  });

  it('throws error on unsupported provider', () => {
    const mockConfig = require('@/lib/config');
    mockConfig.config.AUTH_STRATEGY = 'unsupported';

    expect(() =>
      render(
        <UnifiedAuthStrategySelector>
          <div>Child</div>
        </UnifiedAuthStrategySelector>
      )
    ).toThrow('Unsupported AUTH_STRATEGY: unsupported');
  });
});
