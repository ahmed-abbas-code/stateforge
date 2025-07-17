# 🚀 StateForge Framework

**StateForge** is a modular, strategy-driven full-stack framework for building scalable, secure, and stateful SaaS applications with **Next.js**. It is composed of highly cohesive packages that integrate cleanly across the client, server, and shared layers — designed for production-readiness, pluggable architecture, and TypeScript-first development.

---

## 📦 Packages Overview

| Package                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| [`@sf/authentication`](./src/authentication/)   | Authentication across client/server with strategy support (JWT, Firebase). |
| [`@sf/state`](./src/state/)          | Cross-environment state management for UI, forms, and persistence.          |
| [`@sf/shared`](./src/shared/)           | Common utilities: Axios clients, config loading, middleware, validation.    |

---

## 🔐 Authentication

Secure and extensible authentication package designed for multi-tenant SaaS platforms.

🔗 [Read the Full Authentication Package Docs →](./src/authentication/README.md)

- Strategy-based backend: supports `firebase`, `jwt`, `auth0`
- Client-side React hooks + components: `<AuthProvider>`, `useAuthContext()`
- Server-side token verification, API route handling, and cookie/session logic
- Shared types/schemas for end-to-end validation and safety

---

## 🧠 State Management

Declarative, modular state management with support for local, encrypted, session, and server-based persistence.

🔗 [Read the Full State Package Docs →](./src/state/README.md)

- Browser providers: `AppStateProvider`, `NavigationStateProvider`
- Server-side: Redis, Firestore, or custom backends
- Shared schemas + strategy contracts ensure extensibility
- Great for route progress, config caching, and wizard flows

---

## 🧰 Shared Utilities

Foundation layer powering config, HTTP communication, validation, and middleware.

🔗 [Read the Full Shared Package Docs →](./src/shared/README.md)

- Axios clients (client/server-safe) with authentication strategy support
- Env var validation using Zod for client/server
- Config hydration from `process.env` and `window.__SF_ENV`
- Middleware: rate limiting, IP blocking, audit logger
- Type declarations for framework-wide consistency

---

## 🧩 Strategy-Driven Architecture

Each layer of StateForge is **strategy-first**. Whether it's:
- Authentication (`AUTH_STRATEGY`)
- Persistence (`PersistenceStrategy`)
- Config loading (client vs server)

You can dynamically control implementations through environment config or custom logic.

```bash
AUTH_STRATEGY=firebase
```

---

## 🧪 Example Use Cases

- Protect routes and pages with full-stack authentication enforcement
- Persist user navigation state across sessions
- Sync client-side form state with Redis or Firestore
- Use audit logging + rate limits for critical actions

---

## 📁 File Structure Reference

Each package follows a consistent organization:

```
stateforge/
  ├── authentication/      # Authentication logic (client/server/shared)
  ├── state/               # State persistence and React context
  └── shared/              # Axios clients, env/config, utilities
```

---

## 🧭 Adoption Guide

### 1. 📦 Install the StateForge Packages

Install via monorepo structure or package manager:

```bash
pnpm add @sf/authentication @state/core @sf/shared
```

### 2. ⚙️ Configure the Environment

Set environment variables in `.env`:

```env
AUTH_STRATEGY=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:3000/api
FIREBASE_PRIVATE_KEY=your-firebase-private-key
```

Use `getFrameworkConfig()` or `getServerEnvVar()` to safely access env values.

---

### 3. 🛡️ Authentication Integration

**Server-Side:**

```ts
import { AuthStrategyProvider } from '@sf/authentication/server';
const user = await AuthStrategyProvider.verifyToken(req);
```

**Client-Side:**

Wrap app with context:

```tsx
import { AuthProvider } from '@sf/authentication/client';

<AuthProvider>
  <Component {...pageProps} />
</AuthProvider>
```

Use hooks:

```tsx
const { user, signIn, isAuthenticated } = useAuthContext();
```

---

### 4. 🧠 State Management Integration

**Client-Side:**

```tsx
import { AppStateProvider, NavigationStateProvider } from '@state/client';

<NavigationStateProvider>
  <AppStateProvider>
    <Component {...pageProps} />
  </AppStateProvider>
</NavigationStateProvider>
```

Use hooks:

```tsx
const { navState, setNavState } = useNavigationState();
```

**Server-Side:**

```ts
import { createServerPersistenceStrategy } from '@state/server';

const store = createServerPersistenceStrategy({ type: 'REDIS_SERVER' });
await store.set('session:abc123', { some: 'data' });
```

---

### 5. 🧰 Shared Utilities & Middleware

Use framework utilities:

```ts
import { getFrameworkConfig, validateSchema } from '@sf/shared';
const config = getFrameworkConfig();
const result = validateSchema(mySchema, input);
```

Use middleware:

```ts
import { ipGuard, rateLimiter } from '@sf/shared/middleware';

ipGuard(req, res, () => { /* handle */ });
await rateLimiter.check(res, 10, 'CACHE_KEY');
```

---

## 🧱 Design Best Practices

- Keep auth/state logic in domain folders (`/features/auth`, `/features/onboarding`)
- Use Zod schemas for all runtime validation
- Store state in encrypted/session/local storage for client-side
- Use Redis/Firestore strategies for server-based persistence
- Prefer SWR for session/tenant-aware API data fetching

---

For more design guidance for consuming apps, refer to [this](./docs/architecture.md) document.

---

## Packaging as npm

```bash
pnpm clean && pnpm build && git add . && git commit -m "Commit message" && git push origin main && pnpm release:patch
```

---

## 📜 License

MIT License. Free for personal and commercial use.

