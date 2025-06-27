# Environment Configuration in StateForge

StateForge uses centralized and validated environment variable handling to ensure robust, secure, and environment-specific behavior across both client and server contexts.

---

## 🎯 Purpose

- Centralize environment access
- Validate at runtime with Zod
- Avoid misuse of `process.env` in application code
- Clearly separate client and server variables
- Support multi-environment setups (dev, staging, prod)

---

## 📁 Key Files

```
src/lib/
├── config.ts              # Safe public interface to env vars
├── envConfig.ts           # Loads raw vars from process.env
├── validateEnvSchema.ts   # Zod schema to enforce required vars
├── getRequiredEnv.ts      # Utility for asserting presence of individual vars
```

---

## 🧪 Example `.env.local`

```env
# === Backend Endpoints ===
BACKEND_APP_API_BASE_URL=https://api.example.com
BACKEND_AUTH_API_BASE_URL=https://auth.example.com

# === Auth Strategy ===
NEXT_PUBLIC_AUTH_STRATEGY=firebase  # or 'auth0'

# === Firebase Config ===
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# === Auth0 Config ===
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_DOMAIN=...

# === Persistence Config ===
REDIS_URL=redis://localhost:6379
FIRESTORE_PROJECT_ID=...

# === Security ===
ENCRYPTION_SECRET_KEY=your-256-bit-secret
```

---

## ✅ Validation with Zod

All required environment variables are validated during startup using `validateEnvSchema.ts`:

```ts
const envSchema = z.object({
  BACKEND_APP_API_BASE_URL: z.string().url(),
  BACKEND_AUTH_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_AUTH_STRATEGY: z.enum(['firebase', 'auth0']),
  ENCRYPTION_SECRET_KEY: z.string().min(32),
  // ...other variables
});
```

---

## 🔐 Accessing Env Vars

Always use the exported `config` object:

```ts
import { config } from '@/lib/config';

const apiUrl = config.BACKEND_APP_API_BASE_URL;
```

Avoid accessing `process.env` directly in runtime code.

---

## 🔓 Public vs Private Variables

| Type                | Prefix             | Access Scope       |
|---------------------|--------------------|--------------------|
| Client-side         | `NEXT_PUBLIC_`      | Exposed to browser |
| Server-only         | _(no prefix)_       | Node.js only       |

This separation ensures secrets are not bundled into client builds.

---

## 🛠 Utility Access

For scripts or isolated code:

```ts
import { getRequiredEnv } from '@/lib/getRequiredEnv';

const secret = getRequiredEnv('ENCRYPTION_SECRET_KEY');
```

---

## 🧠 Best Practices

- Mirror `.env.example` with all required vars
- Fail fast with schema validation
- Only expose public vars with `NEXT_PUBLIC_`
- Document new vars in `envSchema` and `config.ts`

---

## 🔗 Related

- [validateEnvSchema.ts](../lib/validateEnvSchema.ts)
- [config.ts](../lib/config.ts)
- [envConfig.ts](../lib/envConfig.ts)
- [getRequiredEnv.ts](../lib/getRequiredEnv.ts)