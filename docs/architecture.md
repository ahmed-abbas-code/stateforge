# 🧠 StateForge – Design Guidance for Consuming Apps

This document provides deeper insights into architectural patterns, extensibility strategies, and best practices for adopting the **StateForge** framework in production SaaS applications.

---

## 🧱 Architectural Principles

### ✅ Modularity First

Structure your app so each concern is decoupled:

```
apps/
  web/
    auth/
    state/
    utils/
    pages/
```

Use internal directories for colocated domain logic like:
- `auth/hooks.ts`, `auth/api.ts`
- `state/navigation.ts`, `state/app.ts`

---

### ✅ Strategy-Driven Design

Each feature (Auth, State, Config) can be swapped via strategy:

```ts
AUTH_STRATEGY=firebase
STATE_PERSISTENCE_STRATEGY=redis
```

Configure with environment variables and register custom strategies where needed.

---

## 🔐 Secure Routing with `withAuthProtection`

Apply route protection easily:

```tsx
export default withAuthProtection(DashboardPage);
```

Or manually:

```tsx
const { isAuthenticated } = useAuthContext();
if (!isAuthenticated) return <SignIn />;
```

---

## 📞 HTTP Client Abstraction

Use `fetchAuthApi`, `serverAxiosClient`, or extend `BaseAxiosClient`.

- Ensures token management
- Enables interceptors, deduplication, retries

Example:

```ts
const client = new ServerAxiosClient().createClientWithInterceptors();
await client.get('/protected');
```

---

## 🧪 Validation and Safety

Use Zod everywhere:

- Validate forms with `validateSchema()`
- Validate env/config at runtime with `validateEnvSchema()`

```ts
const result = validateSchema(userSchema, data);
validateEnvSchema();
```

---

## 🧰 Custom Strategy Example

### Custom Auth Strategy

```ts
class MySSOStrategy implements AuthStrategy {
  async verifyToken(req) { ... }
  async signIn() { ... }
  async signOut() { ... }
}
AuthStrategyProvider.register('sso', MySSOStrategy);
```

Then set `.env`:

```env
AUTH_STRATEGY=sso
```

---

### Custom State Backend

Implement and plug in:

```ts
class MyCustomStore implements PersistenceStrategy {
  get(key) { ... }
  set(key, val) { ... }
}
```

Register via:

```ts
createServerPersistenceStrategy({ type: 'CUSTOM', strategy: new MyCustomStore() });
```

---

## 🧭 Recommended DX Practices

- Wrap `<AuthProvider>`, `<AppStateProvider>`, `<NavigationStateProvider>` in layout
- Organize feature state into `features/*/state.ts`
- Use SWR and `useBackend()` for SSR-safe, token-aware data
- Use `auditLogger` for sensitive flows like login, password change, delete account

---

## 🗂 Suggested Folder Layout

```
apps/
  web/
    features/
      auth/
        hooks.ts
        state.ts
        api.ts
      onboarding/
    middleware/
    pages/
    utils/
    state/
```

---

StateForge is designed to be adapted to your business domain — follow these practices for a scalable, secure foundation.
