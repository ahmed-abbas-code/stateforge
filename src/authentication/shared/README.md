# StateForge - Authentication - Shared

Core shared types, interfaces, constants, and schemas for StateForge authentication and backend modules.

---

## Table of Contents
- [Overview](#overview)
- [Modules](#modules)
  - [getSessionCookieName.ts](#getsessioncookienamets)
  - [sessionCookieOptions.ts](#sessioncookieoptionsts)
  - [AuthProvider.ts](#authproviderts)
  - [Backend.ts](#backendts)
  - [AuthClientContext.ts](#authclientcontextts)
  - [authSchema.ts](#authschemats)
- [License](#license)

---

## Overview

These shared modules provide strong typing, configuration, and validation for secure, type-safe authentication and API development in StateForge-based applications.

---

## Modules

### `getSessionCookieName.ts`

**Purpose:**  
Generate a standardized cookie name for a given provider type and instance.

**Usage:**

```ts
import { getSessionCookieName } from '@sf/getSessionCookieName';

const cookieName = getSessionCookieName('jwt', 'billing');
// returns "sf.jwt.billing-session"
```

---

### `sessionCookieOptions.ts`

**Purpose:**  
Default secure options for session cookies in a cross-provider environment.

**Features:**  
- Strong defaults: `httpOnly`, `secure`, `sameSite`, `path`, and `maxAge`
- Reusable across all providers

**Usage:**

```ts
import { sessionCookieOptions } from '@sf/sessionCookieOptions';

serialize('cookie-name', token, sessionCookieOptions);
```

---

### `AuthProvider.ts`

**Purpose:**  
Defines the interface and shared types for any authentication provider instance in the system.

**Features:**  
- `AuthProviderInstance` with `signIn`, `signOut`, `verifyToken`
- Hook support via `onVerifySuccess`
- Per-provider cookie configuration

**Usage:**

```ts
import type { AuthProviderInstance } from '@sf/AuthProvider';

const firebaseProvider: AuthProviderInstance = {
  id: 'firebase',
  type: 'firebase',
  signIn: async () => {},
  signOut: async () => {},
  verifyToken: async () => null,
  cookieOptions: { ... }
};
```

---

### `Backend.ts`

**Purpose:**  
TypeScript types for data-fetching hooks and backend request/response structures.

**Features:**  
- `RequestBodyPayload`: union of allowed request body types
- `UseBackendOptions`: interface for custom fetch/query hooks
- `UseBackendResult<T>`: generic return type for typed hooks

**Usage:**

```ts
import type { UseBackendOptions, UseBackendResult } from '@sf/Backend';

function useBackend<T>(options: UseBackendOptions): UseBackendResult<T> { /* ... */ }
```

---

### `AuthClientContext.ts`

**Purpose:**  
Shared shape of client-side authentication context (`AuthClientContext`) for use across the app.

**Features:**  
- Includes user, auth state, token helpers, and error handling
- Used by the `AuthProvider` and hooks

**Usage:**

```ts
import type { AuthClientContext } from '@sf/AuthClientContext';

const context: AuthClientContext = useAuthContext();
```

---

### `authSchema.ts`

**Purpose:**  
Zod schemas and types for user/provider validation at runtime and compile-time.

**Features:**  
- `authProviderEnum`: allowed provider values (`firebase`, `auth0`, `jwt`)
- `authUserSchema`: Zod object for valid AuthUserType
- `AuthProviderType` & `AuthUserType`: exported types

**Usage:**

```ts
import { authUserSchema, AuthUserType } from '@sf/authSchema';

const result = authUserSchema.safeParse(data);
if (!result.success) throw new Error('Invalid user object!');

const user: AuthUserType = result.data;
```

---

## License

MIT License.
