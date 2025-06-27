# Middleware in StateForge

StateForge includes a suite of pluggable, composable middleware designed for security, session validation, and audit logging. These can be used in both **Next.js API routes** and **custom server setups** (e.g., Express).

---

## 🧩 Available Middleware

| Middleware               | Purpose                                                 |
|--------------------------|---------------------------------------------------------|
| `withAuthValidation`     | Validates Firebase or Auth0 tokens in API handlers      |
| `withSSOGuard`           | Ensures proper SSO session flow                         |
| `rateLimiter`            | Limits requests per IP, user, or session                |
| `ipGuard`                | Blocks disallowed or suspicious IP addresses            |
| `auditLoggerMiddleware`  | Logs auth/session events (e.g., login/logout)           |
| `autoLogout`             | Triggers logout if tokens are expired or revoked        |

---

## 📁 File Structure

```
src/middleware/
├── auditLoggerMiddleware.ts
├── autoLogout.ts
├── ipGuard.ts
├── rateLimiter.ts
├── withAuthValidation.ts
├── withSSOGuard.ts
└── index.ts            # Re-exports all middleware functions
```

---

## 🔐 Example: `withAuthValidation`

Protects API routes by validating the incoming token.

```ts
import { withAuthValidation } from '@/middleware/withAuthValidation';

export default withAuthValidation(async (req, res, user) => {
  res.status(200).json({ message: `Welcome ${user.name}` });
});
```

Supports both Firebase and Auth0, based on the configured provider.

---

## 📊 Example: `auditLoggerMiddleware`

Tracks login/logout/session lifecycle events.

```ts
import { auditLoggerMiddleware } from '@/middleware/auditLoggerMiddleware';

export default async function handler(req, res) {
  await auditLoggerMiddleware(req);
  res.status(200).end();
}
```

Events can be logged to the console, file system, or external logging services.

---

## ⚙️ Example: `rateLimiter`

Applies throttling based on IP, user, or custom token.

```ts
import { rateLimiter } from '@/middleware/rateLimiter';

export default async function handler(req, res) {
  const allowed = await rateLimiter(req, res);
  if (!allowed) return;

  res.status(200).send('Allowed');
}
```

Highly configurable: time windows, thresholds, identifiers.

---

## 🔁 Auto Logout

Auto-expires sessions and clears auth state after token invalidation.

- Integrated with Axios response interceptors
- Can trigger `logout()` or redirect
- Optional linkage with persistence strategies for cleanup

---

## 🌐 Example Usage in API Routes

```ts
import { withAuthValidation, rateLimiter } from '@/middleware';

export default withAuthValidation(async (req, res, user) => {
  const allowed = await rateLimiter(req, res);
  if (!allowed) return;

  res.status(200).json({ message: `Hello ${user.email}` });
});
```

---

## 🔧 Best Practices

- Chain middleware where applicable
- Use `autoLogout` on both API and client Axios layers
- Use `auditLoggerMiddleware` to build audit trails
- Validate tokens early to fail fast

---

## 🔗 Related

- [verifyFirebaseToken.ts](../lib/verifyFirebaseToken.ts)
- [AuthContext.tsx](../context/auth/AuthContext.tsx)
- [axiosClient.ts](../lib/axiosClient.ts)