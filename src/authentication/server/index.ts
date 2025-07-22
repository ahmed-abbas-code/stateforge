// src/authentication/server/index.ts

// -------------------------
// Provider Exports
// -------------------------

export {
  signIn as signInWithAuth0,
  signOut as signOutFromAuth0,
  verifyToken as verifyAuth0Token,
  auth0SessionCookieName,
} from './providers/auth0';

export {
  signIn as signInWithFirebase,
  signOut as signOutFromFirebase,
  verifyToken as verifyFirebaseToken,
  firebaseSessionCookieName,
} from './providers/firebase';

export {
  signIn as signInWithJwt,
  signOut as signOutFromJwt,
  verifyToken as verifyJwtToken,
  jwtSessionCookieName,
} from './providers/jwt';

// -------------------------
// API Route Handlers
// -------------------------

export { default as authMeHandler } from './pages/api/auth/me';
export { default as authSessionHandler } from './pages/api/auth/session';
export { default as authSigninHandler } from './pages/api/auth/signin';
export { default as authSignoutHandler } from './pages/api/auth/signout';
export { default as authRefreshHandler } from './pages/api/auth/refresh';
export { default as authTokenHandler } from './pages/api/auth/token';

// -------------------------
// Registry & Session Utils
// -------------------------

export * from './utils/registerAuthProviders';
export * from './utils/sessionUtils';
export * from '../shared/utils/getSessionCookieName';
export * from './utils/authRegistry';

// -------------------------
// Middleware & Utilities
// -------------------------

export * from './middleware';
export * from './utils/backend-client';
export * from './utils/cookieHelpers';
export * from './utils/createBackendProxyRoute';
export * from './utils/getServerSideAuthContext';
export * from './utils/mapDecodedToAuthUser';
