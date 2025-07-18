
# StateForge - Authentication - Shared

Core shared types, interfaces, constants, and schemas for StateForge authentication and backend modules.

---

## Table of Contents
- [Overview](#overview)
- [Modules](#modules)
  - [cookieOptions.ts](#cookieoptionsts)
  - [Backend.ts](#backendts)
  - [Auth.ts](#authts)
  - [authSchema.ts](#authschemats)
- [License](#license)

---

## Overview

These shared modules provide strong typing, configuration, and validation for secure, type-safe authentication and API development in StateForge-based applications.

---

## Modules

### `cookieOptions.ts`

**Purpose:**  
Exports shared session cookie name and safe cookie settings for authentication/session flows.

**Features:**  
- `SF_USER_SESSION_COOKIE_NAME`: default session cookie name (e.g. `'session'`)
- `sessionCookieOptions`: best-practice settings for HTTP-only, secure, same-site cookies

**Usage:**

```ts
import { SF_USER_SESSION_COOKIE_NAME, sessionCookieOptions } from '@sf/cookieOptions';

res.setHeader('Set-Cookie', serialize(SF_USER_SESSION_COOKIE_NAME, value, sessionCookieOptions));
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

### `Auth.ts`

**Purpose:**  
TypeScript types/interfaces for authentication user context and strongly-typed API requests.

**Features:**  
- `AuthContextType`: describes the shape of authentication context used in React and Node
- `AuthApiRequest`: extends NextApiRequest with a `user` property

**Usage:**

```ts
import type { AuthContextType } from '@sf/Auth';

const auth: AuthContextType = useAuthContext();
if (auth.isAuthenticated) { /* ... */ }
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
