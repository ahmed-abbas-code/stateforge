# Extending StateForge

StateForge is built to be modular and extensible. It uses interfaces, factory patterns, and runtime validation to let you safely add new strategies, auth providers, middleware, schemas, and utilities — all with minimal coupling.

---

## 🧱 Extendable Components

| Component Type       | Base Interface/Class         | Example Implementation             |
|----------------------|------------------------------|------------------------------------|
| Persistence Strategy | `PersistenceStrategyBase`    | `RedisServerStrategyImpl.ts`       |
| Auth Provider        | `AbstractAuthProvider`       | `FirebaseAuthProviderImpl.tsx`     |
| Middleware           | Express-style function       | `rateLimiter.ts`                   |
| Schema Validators    | `z.ZodSchema`                | `appStateSchema.ts`                |

---

## 🗃 Adding a New Persistence Strategy

1. **Create the strategy class:**

```bash
src/strategies/implementations/MyCustomStrategyImpl.ts
```

2. **Implement `PersistenceStrategyBase`:**

```ts
export class MyCustomStrategyImpl implements PersistenceStrategyBase<MyType> {
  async get() { /* logic */ }
  async set(value: MyType) { /* logic */ }
  async clear() { /* logic */ }
}
```

3. **Register it in the factory:**

```ts
// factory/createPersistenceStrategy.ts
if (type === 'myCustom') return new MyCustomStrategyImpl(schema);
```

---

## 🔐 Adding a New Auth Provider

1. **Create your provider:**

```bash
src/context/auth/MyAuthProviderImpl.tsx
```

2. **Extend the abstract class:**

```ts
export class MyAuthProviderImpl extends AbstractAuthProvider {
  async login() { ... }
  async logout() { ... }
  getUser() { ... }
}
```

3. **Update the strategy selector:**

```tsx
// UnifiedAuthStrategySelector.tsx
case 'mycustom': return <MyAuthProviderImpl>{children}</MyAuthProviderImpl>;
```

4. **Add mapping logic (optional):**

```ts
function mapMyProviderToAuthUser(profile: any): AuthUser { ... }
```

---

## ⚙️ Adding a New Environment Variable

1. Add the key to `.env.example`
2. Update validation in `validateEnvSchema.ts`
3. Expose it via `config.ts`

---

## 🛡 Adding Middleware

1. Create the file in `src/middleware/` (e.g., `roleGuard.ts`)
2. Export a function of type `(req, res, next?) => void | Promise<void>`
3. Use it directly in API routes or middleware chains

Example:

```ts
export async function roleGuard(req, res, next) {
  const user = await getUser(req);
  if (!user.roles.includes('admin')) return res.status(403).end();
  next?.();
}
```

---

## 🧪 Adding Zod Schemas

1. Define schema in `types/validation/`:

```ts
export const userPrefsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  showSidebar: z.boolean(),
});
```

2. Use it in any persistence strategy, hook, or API handler

---

## 🧠 Best Practices

- Always co-locate schemas with the data they validate
- Reuse types from `types/` to ensure consistency
- Keep provider logic out of `context/` unless it's shared
- Avoid importing server-only modules in client paths

---

## 🔗 Related

- [PersistenceStrategyBase.ts](../strategies/PersistenceStrategyBase.ts)
- [AbstractAuthProvider.ts](../context/auth/AbstractAuthProvider.ts)
- [validateEnvSchema.ts](../lib/validateEnvSchema.ts)
- [createPersistenceStrategy.ts](../strategies/factory/createPersistenceStrategy.ts)