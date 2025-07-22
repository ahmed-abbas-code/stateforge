# StateForge - Authentication - Server

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
  - [refresh.ts](#refreshts)
  - [token.ts](#tokents)
  - [AuthStrategyProvider.ts](#authstrategyproviderts)
  - [Provider Modules](#provider-modules)
    - [jwt.ts](#jwtts)
    - [auth0.ts](#auth0ts)
    - [firebase.ts](#firebasets)
- [Usage Examples](./usage.md)
- [License](#license)

---

## Overview

This set of modules streamlines secure authentication, authorization, logging, and API proxying in a modern SaaS or multi-tenant Next.js app. With support for JWT, Firebase, Auth0, SSO, and audit-friendly design.

---

## Modules

### `auth-headers.ts`

**Purpose:**  
Generate Authorization headers for outgoing API requests, extracting a JWT from `localStorage`.

### `withSSOGuard.ts`

**Purpose:**  
Middleware for Next.js API routes. Blocks requests unless an SSO session cookie (`sso_session`) is present.

### `firebase-admin.ts`

**Purpose:**  
Safe, singleton initialization for Firebase Admin SDK. Throws if imported on the client.

### `autoLogoutOnExpire.ts`

**Purpose:**  
Validate Firebase ID tokens, throw/log out if expired, revoked, or invalid.

### `auditLogger.ts`

**Purpose:**  
Log login and logout events for audit/compliance. Use as-is for console logging or extend to log to your database, SIEM, etc.

### `backend-client.ts`

**Purpose:**  
Securely download files from your backend API in the browser, with authentication headers and smart filename handling.

### `createBackendProxyRoute.ts`

**Purpose:**  
Create secure, authenticated proxy routes in Next.js API, forwarding requests to your backend and validating user sessions.

### `mapDecodedToAuthUser.ts`

**Purpose:**  
Normalize decoded JWTs (Firebase or generic) to a consistent `AuthUserType` object for use in your app.

### `[...slug].ts`

**Purpose:**  
API route handler that proxies requests (with JWT/session authentication) to your backend API.

### `session.ts`

**Purpose:**  
Creates an HTTP-only session cookie after verifying a login ID token.

### `signin.ts`

**Purpose:**  
Handles user sign-in via multiple providers.

### `signout.ts`

**Purpose:**  
Handles user sign-out via the correct provider strategy.

### `me.ts`

**Purpose:**  
Fetch the currently authenticated user.

### `refresh.ts`

**Purpose:**  
Refresh a session (token and user info) if still valid.

### `token.ts`

**Purpose:**  
Return current valid token if available for the session.

### `AuthStrategyProvider.ts`

**Purpose:**  
Provides a consistent API for sign-in, sign-out, and token verification—dynamically switching between strategies (Firebase, Auth0, JWT, SSO).

---

## Provider Modules

### `jwt.ts`

**Purpose:**  
JWT-based authentication provider—issues, verifies, and clears secure JWT session cookies.

### `auth0.ts`

**Purpose:**  
Stub Auth0 authentication provider for integrating Auth0 flows.

### `firebase.ts`

**Purpose:**  
Firebase-based authentication provider—issues, verifies, and clears secure Firebase session cookies.

---

## Usage Examples

See [Usage Examples →](./usage.md) for real-world server-side authentication utilities and patterns.

---

## License

MIT License.
