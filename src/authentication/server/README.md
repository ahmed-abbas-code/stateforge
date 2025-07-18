
# StateForge - Autehntication - Server

A comprehensive toolkit for building secure, multi-provider SaaS applications with Next.js—covering backend utilities, authentication providers, API routes, middleware, audit logging, and dynamic auth strategy switching.

---

## Table of Contents
- [Overview](#overview)
- [Modules](#modules)
  - [auth-headers.ts](#auth-headersts)
  - [withSSOGuard.ts](#withssoguardts)
  - [firebase-admin.ts](#firebase-admints)
  - [autoLogoutOnExpire.ts](#autologoutonexpirets)
  - [auditLogger.ts](#auditloggerts)
  - [backend-client.ts](#backend-clientts)
  - [createBackendProxyRoute.ts](#createbackendproxyroutets)
  - [mapDecodedToAuthUser.ts](#mapdecodedtoauthuserts)
  - [[...slug].ts](#slugts)
  - [session.ts](#sessionts)
  - [signin.ts](#signints)
  - [signout.ts](#signoutts)
  - [me.ts](#mets)
  - [AuthStrategyProvider.ts](#authstrategyproviderts)
  - [Provider Modules](#provider-modules)
    - [jwt.ts](#jwtts)
    - [auth0.ts](#auth0ts)
    - [firebase.ts](#firebasets)
- [License](#license)

---

## Overview

This set of modules streamlines secure authentication, authorization, logging, and API proxying in a modern SaaS or multi-tenant Next.js app. With support for JWT, Firebase, Auth0, SSO, and audit-friendly design.

---

## Modules

### `auth-headers.ts`

**Purpose:**  
Generate Authorization headers for outgoing API requests, extracting a JWT from `localStorage`.

**Usage:**

```ts
import { getAuthHeaders } from '@sf/auth-headers';

fetch('/api/protected', {
  headers: {
    ...getAuthHeaders(),
    'Content-Type': 'application/json'
  }
});
```

---

### `withSSOGuard.ts`

**Purpose:**  
Middleware for Next.js API routes. Blocks requests unless an SSO session cookie (`sso_session`) is present.

**Usage:**

```ts
import { withSSOGuard } from '@sf/withSSOGuard';

const handler = (req, res) => {
  // Your protected logic here
};

export default withSSOGuard(handler);
```

---

### `firebase-admin.ts`

**Purpose:**  
Safe, singleton initialization for Firebase Admin SDK. Throws if imported on the client.

**Usage:**

```ts
import { adminAuth, firebaseAdmin } from '@sf/firebase-admin';

const user = await adminAuth.verifyIdToken(idToken);
```

---

### `autoLogoutOnExpire.ts`

**Purpose:**  
Validate Firebase ID tokens, throw/log out if expired, revoked, or invalid.

**Usage:**

```ts
import { autoLogoutOnExpire } from '@sf/autoLogoutOnExpire';

try {
  const decoded = await autoLogoutOnExpire(token);
  // Continue with request
} catch {
  // Force user to re-authenticate
}
```

---

### `auditLogger.ts`

**Purpose:**  
Log login and logout events for audit/compliance. Use as-is for console logging or extend to log to your database, SIEM, etc.

**Usage:**

```ts
import { auditLoginEvent, auditLogoutEvent } from '@sf/auditLogger';

auditLoginEvent('user123');
auditLogoutEvent('user123');
```

---

### `backend-client.ts`

**Purpose:**  
Securely download files from your backend API in the browser, with authentication headers and smart filename handling.

**Usage:**

```ts
import { downloadFile } from '@sf/backend-client';

await downloadFile('/reports/123/download', 'report.pdf');
// Triggers download with authentication and correct filename.
```

---

### `createBackendProxyRoute.ts`

**Purpose:**  
Create secure, authenticated proxy routes in Next.js API, forwarding requests to your backend and validating user sessions.

**Usage:**

```ts
import { createBackendProxyRoute } from '@sf/createBackendProxyRoute';

export default createBackendProxyRoute({
  backendBaseUrl: process.env.BACKEND_APP_API_BASE_URL!,
  allowedMethods: ['GET', 'POST'],
});
// Use in /api/proxy/[...slug] route file.
```

---

### `mapDecodedToAuthUser.ts`

**Purpose:**  
Normalize decoded JWTs (Firebase or generic) to a consistent `AuthUserType` object for use in your app.

**Usage:**

```ts
import { mapDecodedToAuthUser } from '@sf/mapDecodedToAuthUser';

const user = mapDecodedToAuthUser(decodedToken, 'firebase');
// Returns a normalized AuthUserType.
```

---

### `[...slug].ts`

**Purpose:**  
API route handler that proxies requests (with JWT/session authentication) to your backend API.

**Features:**  
- Verifies session cookie & user token
- Forwards requests and responses to/from backend using dynamic path segments
- Returns 401 if unauthenticated

**Usage:**  
Frontend requests to `/api/bff/foo/bar` are forwarded to `/foo/bar` on your backend, with session/user authentication.

---

### `session.ts`

**Purpose:**  
Creates an HTTP-only session cookie after verifying a login ID token.

**Features:**  
- POST only, expects `{ idToken }` in body
- Verifies ID token, creates a secure session cookie (5 days)
- Returns `{ ok: true }` or error

**Usage:**  
Send POST to `/api/auth/session` with `{ idToken: "<token>" }` to receive an authenticated session cookie.

---

### `signin.ts`

**Purpose:**  
Handles user sign-in via multiple providers.

**Features:**  
- POST only
- Calls correct provider strategy for sign-in
- For Firebase/JWT: expects `{ idToken }` in body
- For Auth0: triggers Auth0 SDK redirect

**Usage:**  
POST to `/api/auth/signin` with `{ idToken: "<token>" }` for direct login, or start Auth0 login redirect.

---

### `signout.ts`

**Purpose:**  
Handles user sign-out via the correct provider strategy.

**Features:**  
- POST only
- Calls correct strategy for sign-out (clears cookies, or redirects for Auth0)
- Returns `{ ok: true }` or error

**Usage:**  
POST to `/api/auth/signout` to securely log out.

---

### `me.ts`

**Purpose:**  
Fetch the currently authenticated user.

**Features:**  
- GET only
- Returns `{ user }` (or `null` if not logged in/expired)
- 401 on invalid/expired session

**Usage:**  
GET `/api/auth/me` to retrieve the authenticated user and session state.

---

### `AuthStrategyProvider.ts`

**Purpose:**  
Provides a consistent API for sign-in, sign-out, and token verification—dynamically switching between strategies (Firebase, Auth0, JWT, SSO).

**Features:**  
- Reads `AUTH_STRATEGY` from env to select backend strategy
- Maps all auth actions to the right provider
- Exports:
  - `verifyToken(req): Promise<AuthUserType>`
  - `signIn(req, res): Promise<void>`
  - `signOut(req, res): Promise<void>`

**Usage:**  

```ts
import { AuthStrategyProvider } from '@sf/AuthStrategyProvider';

await AuthStrategyProvider.signIn(req, res);
await AuthStrategyProvider.signOut(req, res);
const user = await AuthStrategyProvider.verifyToken(req);
```

---

## Provider Modules

### `jwt.ts`

**Purpose:**  
JWT-based authentication provider—issues, verifies, and clears secure JWT session cookies.

**Features:**  
- Uses `ENCRYPTION_SECRET_KEY` from env
- Exports `verifyJwtToken`, `signInWithJwt`, `signOutFromJwt`
- Sets HTTP-only cookie (`sf_backend_session`) for user sessions
- Normalizes user info to `AuthUserType`

**Usage:**

```ts
import { verifyJwtToken, signInWithJwt, signOutFromJwt } from '@sf/jwt';

await signInWithJwt(req, res);
await signOutFromJwt(req, res);
const user = await verifyJwtToken(req);
```

---

### `auth0.ts`

**Purpose:**  
Stub Auth0 authentication provider for integrating Auth0 flows. Functions currently throw "Not implemented" errors.

**Features:**  
- Exports `verifyToken`, `signIn`, `signOut`
- Replace stubs with Auth0 SDK calls for production use

**Usage:**

```ts
import { verifyToken, signIn, signOut } from '@sf/auth0';

// Replace with Auth0 logic
```

---

### `firebase.ts`

**Purpose:**  
Firebase-based authentication provider—issues, verifies, and clears secure Firebase session cookies.

**Features:**  
- Uses Firebase Admin SDK and shared configs
- Exports `verifyToken`, `signIn`, `signOut`
- Session cookies via `SF_USER_SESSION_COOKIE_NAME`
- Normalizes user info to `AuthUserType`

**Usage:**

```ts
import { verifyToken, signIn, signOut } from '@sf/firebase';

await signIn(req, res);
await signOut(req, res);
const user = await verifyToken(req);
```

---

## License

MIT License.
