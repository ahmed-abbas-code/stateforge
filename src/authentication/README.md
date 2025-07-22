# 🛡️ StateForge – Authentication

Secure, extensible, and production-ready authentication architecture for **Next.js** SaaS and multi-tenant applications. This package provides seamless full-stack integration of authentication state across client, server, and shared packages using modular TypeScript-first patterns.

---

## 🔍 Overview

The **StateForge Authentication Package** is composed of 3 distinct packages:

| Package            | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| [`@sf/shared`](./stateforge-auth-shared-readme.md)     | Common types, constants, and schemas for validation and API typing.         |
| [`@sf/client`](./stateforge-auth-client-readme.md)     | React hooks and components for managing auth context and backend access.    |
| [`@sf/server`](./stateforge-auth-server-readme.md)     | Server-side middleware, API routes, strategy providers, and session logic.  |

---

## 📦 Packages

### [`@sf/shared`](./shared/README.md)

Provides:
- Shared cookie config and session constants
- Strongly-typed backend types for API requests/responses
- Zod schemas for runtime validation (e.g., `authUserSchema`)
- Enums/types for pluggable auth strategies (`firebase`, `jwt`, `auth0`)

Example:
```ts
import { authUserSchema, AuthUserType } from '@sf/authSchema';
```

---

### [`@sf/client`](./client/README.md)

Includes:
- Global `<AuthProvider />` and `<AuthProtection />` components
- Hooks for sign-in/out, user session, backend fetch (`useBackend`)
- SWR-powered caching and tenant-aware data fetching
- Route protection HOC (`withAuthProtection`)

Example:
```tsx
const { user, signIn, signOut, isAuthenticated } = useAuthContext();
```

---

### [`@sf/server`](./server/README.md)

Implements:
- Strategy-driven auth backend (JWT, Firebase, Auth0 stubs)
- API route handlers (`/session`, `/signin`, `/signout`, `/me`)
- Session cookie management and token verification
- Secure proxying to backend APIs
- Middleware and audit logging utilities

Example:
```ts
const user = await AuthStrategyProvider.verifyToken(req);
```

---

## 🔄 Strategy Switching

The authentication package dynamically chooses the provider based on `AUTH_STRATEGY` (env var):

```bash
AUTH_STRATEGY=firebase # or jwt, auth0
```

Each provider (in `server/providers`) implements:
- `verifyToken()`
- `signIn()`
- `signOut()`

---

## 🧪 Example Flow

1. User signs in with Firebase ID token
2. `@sf/server` verifies token and issues HTTP-only session cookie
3. `@sf/client` exposes auth context and fetch utilities
4. Backend routes use middleware or `AuthStrategyProvider` to validate sessions
5. Shared types and schemas ensure safety across stack

---

## 📁 File Structure Reference

| Package       | Key Files                                                      |
|---------------|----------------------------------------------------------------|
| `shared`      | `cookieOptions.ts`, `authSchema.ts`, `Auth.ts`, `Backend.ts`   |
| `client`      | `useAuth`, `useBackend`, `AuthProvider`, `useSignIn`           |
| `server`      | `AuthStrategyProvider.ts`, `/api/auth/*`, `firebase-admin.ts`  |

---

## 📜 License

MIT License
