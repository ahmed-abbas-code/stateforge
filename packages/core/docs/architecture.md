
# StateForge Architecture

**StateForge** is a secure, modular state management framework designed for scalable SaaS applications. It unifies client state, navigation state, and authentication across environments using a typed strategy-based approach.

## Key Principles

- ✅ Strategy Pattern for persistence (client, server, navigation)
- ✅ Abstract Auth Provider (Firebase, Auth0)
- ✅ Runtime schema validation using Zod
- ✅ SSR + CSR-compatible navigation hydration
- ✅ Axios-based API clients with global auth injection
- ✅ Pluggable middleware for IP guard, rate limits, and SSO

## Directory Overview

```
src/
├── context/          # Global shared contexts for auth and state
├── hooks/            # React hooks to use strategy/state
├── lib/              # Axios clients, Firebase setup, env configs
├── middleware/       # Express/Next.js-compatible middleware
├── strategies/       # Strategy pattern implementation
├── types/            # Shared types and Zod schemas
├── utils/            # Helper functions
└── index.ts          # Public exports
```

## Usage Flow

1. **Select strategy via `createPersistenceStrategy()`**
2. **Use `usePersistedFramework()` to bind shared state to strategy**
3. **Wrap your app in `AuthContext` + `AppStateContext`**
4. **Fetch data using `axiosApp` or `axiosAuth`**
5. **Secure APIs using `withAuthValidation`, `rateLimiter`, etc.**
