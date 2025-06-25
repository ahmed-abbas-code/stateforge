
# Middleware in StateForge

StateForge includes built-in security, session, and audit middleware to protect routes, validate sessions, and enforce policies. These can be used in both Next.js API routes and custom server setups.

---

## 🔐 Available Middleware

| Middleware                 | Purpose                                                |
|----------------------------|--------------------------------------------------------|
| `withAuthValidation`       | Verifies tokens (Firebase or Auth0) in API routes     |
| `withSSOGuard`             | Handles SSO session initialization and validation     |
| `rateLimiter`              | IP- or user-based request throttling                  |
| `ipGuard`                  | Blocks suspicious or disallowed IPs                   |
| `auditLoggerMiddleware`    | Logs login/logout and session events                  |
| `autoLogout`               | Expires user sessions on token invalidation           |

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
└── index.ts                  # Re-exports all middleware
```

---

## 🛡 Example: `withAuthValidation`

Wraps API handlers to validate auth tokens.

```ts
import { withAuthValidation } from '@/middleware/withAuthValidation';

export default withAuthValidation(async (req, res, user) => {
  res.status(200).json({ message: `Welcome ${user.name}` });
});
```

Supports Firebase and Auth0, using the strategy set in `.env.local`.

---

## 📊 Example: `auditLoggerMiddleware`

Logs login/logout activity to console, file, or remote service:

```ts
import { auditLoggerMiddleware } from '@/middleware/auditLoggerMiddleware';

export default async function handler(req, res) {
  await auditLoggerMiddleware(req);
  res.status(200).end();
}
```

---

## ⚙️ Example: `rateLimiter`

```ts
import { rateLimiter } from '@/middleware/rateLimiter';

export default async function handler(req, res) {
  const allowed = await rateLimiter(req, res);
  if (!allowed) return;

  res.status(200).send('Request allowed');
}
```

Configurable by IP, route, or session key.

---

## 🔄 Auto Logout

Automatically clears tokens and app state after expiration:

- Hooked into Axios response interceptors
- Can dispatch logout or redirect
- Optionally tied to persistent state expiration

---

## 🔗 Related

- [verifyFirebaseToken.ts](../lib/verifyFirebaseToken.ts)
- [AuthContext.tsx](../context/auth/AuthContext.tsx)
- [axiosClient.ts](../lib/axiosClient.ts)
