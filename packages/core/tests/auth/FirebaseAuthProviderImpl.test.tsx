import { render } from '@testing-library/react';
import { FirebaseAuthProviderImpl } from '@/context/auth/FirebaseAuthContextProvider';
import { AuthContext } from '@/context/auth/AuthContext';
import { auth } from '@/lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/firebase', () => ({
  auth: {},
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual<typeof import('firebase/auth')>('firebase/auth');
  return {
    ...actual,
    onAuthStateChanged: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: vi.fn(),
  };
});

describe('FirebaseAuthProviderImpl', () => {
  it('calls onAuthStateChanged on mount', () => {
    render(<FirebaseAuthProviderImpl><div>Test</div></FirebaseAuthProviderImpl>);
    expect(onAuthStateChanged).toHaveBeenCalled();
  });

  it('login triggers signInWithPopup', async () => {
    let ctxFn: any;
    render(
      <FirebaseAuthProviderImpl>
        <AuthContext.Consumer>
          {ctx => {
            ctxFn = ctx;
            return null;
          }}
        </AuthContext.Consumer>
      </FirebaseAuthProviderImpl>
    );

    await ctxFn?.login();
    expect(signInWithPopup).toHaveBeenCalled();
  });

  it('logout triggers signOut', async () => {
    let ctxFn: any;
    render(
      <FirebaseAuthProviderImpl>
        <AuthContext.Consumer>
          {ctx => {
            ctxFn = ctx;
            return null;
          }}
        </AuthContext.Consumer>
      </FirebaseAuthProviderImpl>
    );

    await ctxFn?.logout();
    expect(signOut).toHaveBeenCalled();
  });

  it('getToken returns token if user exists', async () => {
    // Mocking read-only property: auth.currentUser
    Object.defineProperty(auth, 'currentUser', {
      value: { getIdToken: vi.fn().mockResolvedValue('token123') },
      configurable: true,
    });

    let ctxFn: any;
    render(
      <FirebaseAuthProviderImpl>
        <AuthContext.Consumer>
          {ctx => {
            ctxFn = ctx;
            return null;
          }}
        </AuthContext.Consumer>
      </FirebaseAuthProviderImpl>
    );

    const token = await ctxFn?.getToken();
    expect(token).toBe('token123');
  });
});
