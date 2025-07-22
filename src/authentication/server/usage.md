# 📘 StateForge – Server Usage Examples

This guide provides practical usage patterns for core modules from the `@sf/server` package including providers, middleware, session handling, and proxy routes.

---

## 🔐 Auth Strategy Provider

### Sign in with dynamic strategy

```ts
import { AuthStrategyProvider } from '@sf/AuthStrategyProvider';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await AuthStrategyProvider.signIn(req, res);
}
```

---

### Verify token

```ts
const user = await AuthStrategyProvider.verifyToken(req);

if (!user) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

### Sign out

```ts
await AuthStrategyProvider.signOut(req, res);
res.status(200).json({ ok: true });
```

---

## 🍪 Session Management

### Set secure session cookie

```ts
import { createSessionCookie } from '@sf/sessionUtils';

await createSessionCookie({
  res,
  token: '<jwt_or_id_token>',
  providerId: 'firebase',
  providerType: 'firebase',
});
```

---

### Clear all sessions

```ts
import { clearSessionCookies } from '@sf/sessionUtils';

clearSessionCookies(res);
```

---

## 📦 Backend Proxy Route

### Secure backend proxy (e.g. `/api/bff/[...slug].ts`)

```ts
import { createBackendProxyRoute } from '@sf/createBackendProxyRoute';

export default createBackendProxyRoute({
  backendBaseUrl: process.env.BACKEND_API_URL!,
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
});
```

Frontend fetch:

```ts
await fetch('/api/bff/reports/weekly');
```

---

## 🔁 Middleware

### SSO Guard for API protection

```ts
import { withSSOGuard } from '@sf/withSSOGuard';

export default withSSOGuard((req, res) => {
  res.status(200).json({ ok: true });
});
```

---

## 🔍 Auth Headers Utility

### Use in backend-to-backend fetches

```ts
import { getAuthHeaders } from '@sf/auth-headers';

fetch(`${backendUrl}/protected`, {
  headers: {
    ...getAuthHeaders(),
    'Content-Type': 'application/json'
  }
});
```

---

## 📋 Token Refresh

### Expose refresh endpoint

```ts
import { refreshSession } from '@sf/sessionUtils';

export default async function handler(req, res) {
  const { token, user } = await refreshSession(req, res);
  res.status(200).json({ token, user });
}
```

---

## 🔐 Firebase Admin

### Verify ID token manually

```ts
import { adminAuth } from '@sf/firebase-admin';

const decoded = await adminAuth.verifyIdToken(idToken);
```

---

## 🧪 Test Stub for Auth0 (or Custom Providers)

```ts
import { signIn, verifyToken } from '@sf/auth0';

try {
  await signIn(req, res);
} catch (err) {
  console.warn('Auth0 not yet implemented.');
}
```

---

## ✅ Summary

- Use `AuthStrategyProvider` for sign-in/out/verify flows
- Manage cookies with `sessionUtils`
- Protect APIs using `withSSOGuard`
- Securely forward to backend APIs with `createBackendProxyRoute`

