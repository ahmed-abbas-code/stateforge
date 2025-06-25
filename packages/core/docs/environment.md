
# Environment Configuration in StateForge

StateForge uses strict environment variable validation and centralized config loading to ensure that runtime credentials, tokens, and endpoints are safely and reliably accessed across both client and server environments.

---

## 🎯 Purpose

- Centralize access to environment variables
- Prevent undefined/misconfigured runtime behavior
- Separate concerns for **auth** vs **app** APIs
- Support multiple environments: dev, staging, prod

---

## 📁 Key Files

```
src/lib/
├── config.ts              # Public export of env variables
├── envConfig.ts           # Raw variable loader
├── validateEnvSchema.ts   # Zod-based validation schema
├── getRequiredEnv.ts      # Runtime assertion helper
```

---

## 📄 Example `.env.local`

```env
# === Backend App & Auth APIs ===
BACKEND_APP_API_BASE_URL=https://api.myapp.com
BACKEND_AUTH_API_BASE_URL=https://auth.myapp.com

# === Authentication Provider Strategy ===
NEXT_PUBLIC_AUTH_STRATEGY=firebase    # or 'auth0'

# === Firebase Credentials ===
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# === Auth0 Credentials ===
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_DOMAIN=...

# === Redis/Firestore Config ===
REDIS_URL=redis://localhost:6379
FIRESTORE_PROJECT_ID=...

# === Encryption Keys ===
ENCRYPTION_SECRET_KEY=your-256-bit-secret
```

---

## ✅ Runtime Validation

Validation is powered by Zod to ensure all required variables are present:

```ts
const envSchema = z.object({
  BACKEND_APP_API_BASE_URL: z.string().url(),
  BACKEND_AUTH_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_AUTH_STRATEGY: z.enum(['firebase', 'auth0']),
  // more vars...
});
```

This runs on app boot via `validateEnvSchema.ts`.

---

## 🧠 Accessing Env Vars

Always use `config.ts` to access variables:

```ts
import { config } from '@/lib/config';

const url = `${config.BACKEND_APP_API_BASE_URL}/user/profile`;
```

> Do not use `process.env` directly in app code.

---

## 🔐 Public vs Private Vars

| Variable Scope         | Prefix Required?        | Exposure                         |
|------------------------|-------------------------|----------------------------------|
| Client-accessible      | `NEXT_PUBLIC_`           | Exposed in frontend bundle       |
| Server-only            | No prefix                | Only available in backend code   |

---

## 🔧 Custom Access Helpers

Use `getRequiredEnv('VAR_NAME')` if loading raw variables in isolated tools or scripts.

---

## 🔗 Related

- [config.ts](../lib/config.ts)
- [envConfig.ts](../lib/envConfig.ts)
- [validateEnvSchema.ts](../lib/validateEnvSchema.ts)
- [firebase.ts](../lib/firebase.ts)
- [axiosClient.ts](../lib/axiosClient.ts)
