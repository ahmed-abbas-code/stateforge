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
} from './providers/jwt';

export * from './pages/api/auth/me';
export * from './pages/api/auth/session';
export * from './pages/api/auth/signin';
export * from './pages/api/auth/signout';
