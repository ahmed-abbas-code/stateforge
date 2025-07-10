// src/authentication/server/index.ts

export {
  signIn as signInWithAuth0,
  signOut as signOutFromAuth0,
  verifyToken as verifyAuth0Token,
} from './providers/auth0';

export {
  signIn as signInWithFirebase,
  signOut as signOutFromFirebase,
  verifyToken as verifyFirebaseToken,
} from './providers/firebase';

export {
  signIn as signInWithJwt,
  signOut as signOutFromJwt,
  verifyToken as verifyJwtToken,
  jwtSessionCookieName,
} from './providers/jwt';

export { default as authMeHandler } from './pages/api/auth/me';
export { default as authSessionHandler } from './pages/api/auth/session';
export { default as authSigninHandler } from './pages/api/auth/signin';
export { default as authSignoutHandler } from './pages/api/auth/signout';

export * from './AuthStrategyProvider';

export * from './middleware/index';
export * from './utils/mapDecodedToAuthUser';
export * from './utils/createBackendProxyRoute';
export * from './utils/backend-client';

