
# Extending StateForge

StateForge is designed with extensibility in mind. It follows SOLID principles, enabling developers to introduce new persistence strategies, authentication providers, and utilities with minimal coupling.

---

## 🧱 Extendable Components

| Component Type        | Base Interface/Class            | Example Implementation             |
|------------------------|----------------------------------|------------------------------------|
| Persistence Strategy   | `PersistenceStrategyBase`        | `RedisServerStrategyImpl.ts`       |
| Auth Provider          | `AbstractAuthProvider`           | `FirebaseAuthProviderImpl.tsx`     |
| Schema Validators      | `z.ZodSchema`                    | `appStateSchema.ts`                |
| Middleware             | Functional middleware pattern    | `rateLimiter.ts`                   |

---

## 🧩 Adding a New Persistence Strategy

1. **Create the strategy file:**

```bash
src/strategies/implementations/MyCustomStrategyImpl.ts
```

2. **Implement `PersistenceStrategyBase`:**

```ts
export class MyCustomStrategyImpl implements PersistenceStrategyBase<MyType> {
  async get() { /* your logic */ }
  async set(value: MyType) { /* your logic */ }
  async clear() { /* your logic */ }
}
```

3. **Register it in the factory:**

```ts
// createPersistenceStrategy.ts
if (type === 'myCustom') return new MyCustomStrategyImpl(schema);
```

---

## 🔐 Adding a New Auth Provider

1. **Create your provider component:**

```bash
src/context/auth/MyAuthProviderImpl.tsx
```

2. **Extend the abstract class:**

```ts
export class MyAuthProviderImpl extends AbstractAuthProvider { ... }
```

3. **Update the strategy selector:**

```ts
// UnifiedAuthStrategySelector.tsx
case 'mycustom': return <MyAuthProviderImpl>{children}</MyAuthProviderImpl>;
```

4. **Add mapping logic (optional):**

```ts
mapMyProviderToAuthUser(profile: any): AuthUser { ... }
```

---

## 📄 Adding a New Environment Variable

1. Add it to `.env.example`
2. Update `envSchema` in `validateEnvSchema.ts`
3. Export via `config.ts`

---

## 🛡 Adding Middleware

1. Create a file in `middleware/` (e.g., `roleGuard.ts`)
2. Export a function that receives `(req, res, next)`
3. Chain it in your handler or API route

---

## 📑 Adding Zod Schemas

1. Create a schema file under `types/validation/`
2. Define and export with `z.object()`
3. Use in strategies, hooks, or middleware

---

## 🧠 Best Practices

- Reuse types across layers using shared `types/`
- Validate all dynamic data using Zod
- Keep implementation-specific logic out of `context/` and `hooks/`

---

## 🔗 Related

- [PersistenceStrategyBase.ts](../strategies/PersistenceStrategyBase.ts)
- [AbstractAuthProvider.ts](../context/auth/AbstractAuthProvider.ts)
- [validateEnvSchema.ts](../lib/validateEnvSchema.ts)
- [createPersistenceStrategy.ts](../strategies/factory/createPersistenceStrategy.ts)
