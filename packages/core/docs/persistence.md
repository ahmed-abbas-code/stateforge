# Persistence Strategies in StateForge

StateForge uses the **Strategy Pattern** to manage state persistence across different environments and scopes — including client-side, server-side, and navigation-based storage.

---

## 🧩 Strategy Types

### 1. **Client-Side Strategies**

| Strategy                    | Description                                       |
|-----------------------------|---------------------------------------------------|
| `LocalStorageStrategyImpl`  | Plain key/value storage via `localStorage`        |
| `EncryptedStorageStrategyImpl` | AES-encrypted storage for sensitive data      |

### 2. **Server-Side Strategies**

| Strategy                    | Description                                       |
|-----------------------------|---------------------------------------------------|
| `RedisServerStrategyImpl`   | Fast, ephemeral storage for sessions              |
| `FirestoreStrategyImpl`     | Durable, NoSQL persistence using Firebase         |
| `RestApiStrategyImpl`       | Proxy to backend REST API for state operations   |

### 3. **Navigation Strategy**

| Strategy                      | Description                                     |
|-------------------------------|-------------------------------------------------|
| `NavigationStateStrategyImpl` | Volatile session/memory state for flows         |

---

## 🏭 Strategy Factory

Create a persistence strategy using the factory:

```ts
const strategy = createPersistenceStrategy({
  type: 'localStorage', // or 'redis', 'firestore', etc.
  schema: userPrefsSchema,
});
```

All strategies must implement the `PersistenceStrategyBase<T>` interface.

---

## 🔐 Schema Validation with Zod

Ensure safe serialization and validation:

```ts
const strategy = createPersistenceStrategy({
  type: 'redis',
  schema: z.object({
    theme: z.enum(['light', 'dark']),
    lastLogin: z.string().optional(),
  }),
});
```

> Using schemas ensures safe rehydration of typed state.

---

## 🧠 Hook Usage

Bind a strategy to a specific state key using hooks:

```ts
const { value, setValue } = usePersistedFramework({
  key: 'user_prefs',
  strategy,
});
```

For navigation flows:

```ts
const { value, setValue } = useNavigationPersistedState({
  key: 'onboarding_step',
  defaultValue: { step: 1 },
  schema: z.object({ step: z.number() }),
});
```

---

## 🛠 Extending with New Strategies

1. Create `YourStrategyImpl.ts` in `strategies/implementations/`
2. Implement the `PersistenceStrategyBase<T>` interface
3. Register it in `createPersistenceStrategy.ts` factory

---

## ✅ Best Practices

- Use `EncryptedStorageStrategyImpl` for storing client auth/session data
- Use `RedisServerStrategyImpl` for short-lived session data
- Use `FirestoreStrategyImpl` or `RestApiStrategyImpl` for durable persistence
- Pair all strategies with Zod schemas for safety
- Do not use navigation state for sensitive or permanent data

---

## 🗂 File Structure

```
src/strategies/
├── factory/
│   └── createPersistenceStrategy.ts
├── PersistenceStrategyBase.ts
└── implementations/
    ├── LocalStorageStrategyImpl.ts
    ├── EncryptedStorageStrategyImpl.ts
    ├── RedisServerStrategyImpl.ts
    ├── FirestoreStrategyImpl.ts
    ├── RestApiStrategyImpl.ts
    └── NavigationStateStrategyImpl.ts
```

---

## 🔗 Related

- [usePersistedFramework.ts](../hooks/usePersistedFramework.ts)
- [useNavigationPersistedState.ts](../hooks/useNavigationPersistedState.ts)
- [PersistenceStrategyBase.ts](../strategies/PersistenceStrategyBase.ts)
- [createPersistenceStrategy.ts](../strategies/factory/createPersistenceStrategy.ts)