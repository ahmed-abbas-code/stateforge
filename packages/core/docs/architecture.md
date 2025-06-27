# StateForge Architecture

**StateForge** is a modular, strategy-driven framework for building secure, scalable SaaS applications using Next.js. It unifies authentication, state persistence, navigation flows, and environment-aware APIs using pluggable strategies and shared context.

---

## 🧱 Core Design Principles

- ✅ **Strategy Pattern** for persistence (client, server, navigation)
- ✅ **Abstract Auth Provider** to support multiple identity systems (Firebase, Auth0)
- ✅ **Runtime schema validation** using Zod
- ✅ **Unified context APIs** for auth and global state
- ✅ **SSR + CSR compatibility** for hydration and auth
- ✅ **Middleware-first architecture** for route protection
- ✅ **Axios-based API clients** with global token injection

---

## 🗂 Directory Overview

```
src/
├── context/           # React contexts for auth and app state
│   ├── auth/          # Auth provider implementations & selection
│   └── state/         # App and navigation state providers
├── hooks/             # Hooks to use persisted state strategies
├── lib/               # Axios clients, Firebase setup, env schema, helpers
├── middleware/        # Reusable security middleware (auth, SSO, rate limit)
├── strategies/        # Strategy pattern for state persistence
│   ├── factory/       # Dynamic strategy resolver
│   └── implementations/ # Redis, Firestore, EncryptedStorage, etc.
├── types/             # Zod schemas and shared types
├── utils/             # Thin wrappers and API utilities
└── index.ts           # Module entry and exports
```

---

## ⚙️ Usage Flow

1. **Define a state schema** using Zod
2. **Select a strategy** via `createPersistenceStrategy({ type, schema })`
3. **Use `usePersistedFramework()`** or `useNavigationPersistedState()` to bind values
4. **Wrap app in** `AuthProvider`, `AppStateProvider`, and optionally `NavigationStateProvider`
5. **Use `axiosApp` and `axiosAuth`** for API calls with built-in token injection
6. **Protect routes and handlers** using middleware like `withAuthValidation`, `rateLimiter`, or `ipGuard`

---

## 🔄 SSR + CSR Compatibility

StateForge supports server-side rendering hydration by:
- Deferring certain logic to `client-only.ts` or `server-only.ts`
- Avoiding direct `process.env` access in shared modules
- Providing separate strategies for browser and server persistence

---

## 🛠 Extensibility

Every component of StateForge is pluggable:
- Add new **auth providers** by extending `AbstractAuthProvider`
- Add new **persistence strategies** by implementing `PersistenceStrategyBase`
- Add new **middleware** for custom policies (e.g., RBAC, geo-blocking)
- Add new **schemas** for typed, validated state

---

## 🔐 Security Principles

- Encrypted client-side storage (`EncryptedStorageStrategyImpl`)
- Secure, cookie-based Auth0 sessions
- Token validation with Firebase Admin SDK
- Middleware for rate limiting, IP blocking, audit logging

---

## 🔗 Related

- [auth.md](./auth.md)
- [persistence.md](./persistence.md)
- [api-clients.md](./api-clients.md)
- [middleware.md](./middleware.md)
- [extending.md](./extending.md)