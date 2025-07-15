
# StateForge - Shared

A comprehensive set of modules for robust, secure API communication, runtime configuration, validation utilities, and essential middleware/logging in StateForge apps.

---

## Table of Contents
- [Overview](#overview)
- [Modules](#modules)
  - [Axios Client & HTTP Utilities](#axios-client--http-utilities)
    - [baseAxiosClient.ts](#baseaxiosclientts)
    - [serverAxiosClient.ts](#serveraxiosclientts)
    - [fetchAuthApi.ts](#fetchauthapits)
  - [Universal, Client, and Server Config Utilities](#universal-client-and-server-config-utilities)
    - [client.ts](#clientts)
    - [server.ts](#serverts)
    - [clientConfig.ts](#clientconfigts)
    - [getClientFrameworkConfig.ts](#getclientframeworkconfigts)
    - [getServerFrameworkConfig.ts](#getserverframeworkconfigts)
    - [getServerEnvVar.ts](#getserverenvvarts)
    - [getFrameworkConfig.ts](#getframeworkconfigts)
  - [Validation Utilities](#validation-utilities)
    - [validateSchema.ts](#validateschemats)
    - [validateEnvSchema.ts](#validateenvschemats)
  - [Middleware, Audit & Miscellaneous](#middleware-audit--miscellaneous)
    - [auditLoggerMiddleware.ts](#auditloggermiddlewarets)
    - [ipGuard.ts](#ipguardts)
    - [rateLimiter.ts](#ratelimiterts)
    - [axios.d.ts](#axiosdts)
    - [env.d.ts](#envdts)
    - [FrameworkConfig.ts](#frameworkconfigts)
    - [envSchema.ts](#envschemats)
- [License](#license)

---

## Overview

These modules provide a strong foundation for secure API requests, multi-environment config, runtime validation, audit logging, protection middleware (rate limiting, IP block), and flexible authentication.

---

## Modules

### Axios Client & HTTP Utilities

#### `baseAxiosClient.ts`

**Purpose:**  
Abstract base class for Axios HTTP clients supporting various authentication strategies.

**Usage:**

```ts
class MyApiClient extends BaseAxiosClient {
  // Implement required abstract methods
}

const client = new MyApiClient().createClient('https://api.example.com');
client.get('/resource', { authConfig: { strategy: 'jwt' } });
```

---

#### `serverAxiosClient.ts`

**Purpose:**  
Node.js/Next.js backend Axios client with API key support and request deduplication.

**Usage:**

```ts
import { ServerAxiosClient } from '@shared';

const client = new ServerAxiosClient().createClientWithInterceptors('https://api.example.com', 'myService');
await client.get('/data');
```

---

#### `fetchAuthApi.ts`

**Purpose:**  
Axios instance preconfigured for authentication-related API calls (e.g., login, user info), attaches Bearer token if available in browser.

**Usage:**

```ts
import { fetchAuthApi } from '@shared/utils/client';

const response = await fetchAuthApi.post('/signin', { email, password });
```

---

### Universal, Client, and Server Config Utilities

#### `client.ts`

**Purpose:**  
Barrel file: re-exports client-side utilities (config, fetch, env, validation).

**Usage:**

```ts
import { fetchAppApi, getClientEnvVar } from '@shared/utils/client';
```

---

#### `server.ts`

**Purpose:**  
Barrel file: re-exports server-side utilities (logging, env, config, Axios).

**Usage:**

```ts
import { getServerEnvVar, serverAxiosClient } from '@shared/utils/server';
```

---

#### `clientConfig.ts`

**Purpose:**  
Exports browser-safe API base URLs from public environment variables.

**Usage:**

```ts
import { clientConfig } from '@shared/utils/client';
fetch(`${clientConfig.BACKEND_APP_API_BASE_URL}/api/data`);
```

---

#### `getClientFrameworkConfig.ts`

**Purpose:**  
Loads and validates public framework config from `window.__SF_ENV` (browser only).

**Usage:**

```ts
import { getClientFrameworkConfig } from '@shared/utils/client';
const config = getClientFrameworkConfig();
```

---

#### `getServerFrameworkConfig.ts`

**Purpose:**  
Loads and validates server config/env from `process.env` using Zod schemas (server only).

**Usage:**

```ts
import { getServerFrameworkConfig } from '@shared/utils/server';
const config = getServerFrameworkConfig();
```

---

#### `getServerEnvVar.ts`

**Purpose:**  
Safely access server-only env vars by name; throws if missing or run in browser.

**Usage:**

```ts
import { getServerEnvVar } from '@shared/utils/server';
const key = getServerEnvVar('FIREBASE_PRIVATE_KEY');
```

---

#### `getFrameworkConfig.ts`

**Purpose:**  
Universal loader: returns config for client or server, as appropriate.

**Usage:**

```ts
import { getFrameworkConfig } from '@shared/utils';
const config = getFrameworkConfig();
```

---

### Validation Utilities

#### `validateSchema.ts`

**Purpose:**  
Reusable helper for validating data against Zod schemas.

**Usage:**

```ts
import { validateSchema } from '@shared/utils/client';
import { mySchema } from './schemas';

const result = validateSchema(mySchema, input, 'FormData');
if (!result.success) {
  // Handle or display error
}
```

---

#### `validateEnvSchema.ts`

**Purpose:**  
Validate current environment/config against Zod schema at runtime (server or client).

**Usage:**

```ts
import { validateEnvSchema } from '@shared/utils';
validateEnvSchema(); // Throws if .env/config is invalid
```

---

### Middleware, Audit & Miscellaneous

#### `auditLoggerMiddleware.ts`

**Purpose:**  
Log audit events, user actions, and meta info to the server console.

**Usage:**

```ts
import { auditLogger } from '@shared/utils/server';
auditLogger('LOGIN_SUCCESS', userId, { ip: '127.0.0.1' });
```

---

#### `ipGuard.ts`

**Purpose:**  
Middleware to block requests from specific IPs.

**Usage:**

```ts
import { ipGuard } from '@sf/shared/middleware';
export default function handler(req, res) {
  ipGuard(req, res, () => { /* handler logic */ });
}
```

---

#### `rateLimiter.ts`

**Purpose:**  
Per-route or per-IP rate limiting with `next-rate-limit`.

**Usage:**

```ts
import { rateLimiter } from '@sf/shared/middleware';
export default async function handler(req, res) {
  await rateLimiter.check(res, 10, 'CACHE_TOKEN');
  // handler logic
}
```

---

#### `axios.d.ts`

**Purpose:**  
Type declaration for extending Axios config with `authConfig` property.

**Usage:**

```ts
import axios from 'axios';
axios.get('/api/foo', { authConfig: { provider: 'firebase' } });
```

---

#### `env.d.ts`

**Purpose:**  
Type definitions for public/private env vars and SSR window env hydration.

**Usage:**

```ts
if (window.__SF_ENV) {
  console.log(window.__SF_ENV.NEXT_PUBLIC_FIREBASE_API_KEY);
}
```

---

#### `FrameworkConfig.ts`

**Purpose:**  
Strongly-typed framework config interface (auth strategy, API URLs).

**Usage:**

```ts
import type { FrameworkConfig } from '@sf/shared';
const config: FrameworkConfig = { AUTH_STRATEGY: 'firebase', ... };
```

---

#### `envSchema.ts`

**Purpose:**  
Zod schemas for runtime validation of public and private env vars.

**Usage:**

```ts
import { envPublicSchema, envPrivateSchema } from '@sf/shared';
const publicVars = envPublicSchema.parse(process.env);
const privateVars = envPrivateSchema.parse(process.env);
```

---

## License

MIT License.
