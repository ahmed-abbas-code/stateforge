
# Persistence Strategies in StateForge

StateForge uses the **Strategy Pattern** to provide a flexible, pluggable system for persisting state across different layers of your application — client, server, and navigation-based storage.

---

## 🧩 Strategy Categories

### 1. Client-Side Strategies
| Strategy                   | Description                                    |
|----------------------------|------------------------------------------------|
| `LocalStorageStrategyImpl` | Raw `localStorage` key/value storage           |
| `EncryptedStorageStrategyImpl` | AES-encrypted storage for sensitive data     |

### 2. Server-Side Strategies
| Strategy                   | Description                                    |
|----------------------------|------------------------------------------------|
| `RedisServerStrategyImpl`  | In-memory, fast cache layer for session data   |
| `FirestoreStrategyImpl`    | Durable, NoSQL DB strategy (Firebase)          |
| `RestApiStrategyImpl`      | Uses a backend API endpoint for persistence    |

### 3. Navigation-Scoped Strategy
| Strategy                      | Description                                   |
|-------------------------------|-----------------------------------------------|
| `NavigationStateStrategyImpl` | Session/memory-bound state for routing flows  |

---

## 🛠 Strategy Factory

StateForge provides a centralized factory to resolve and instantiate strategies:

```ts
const strategy = createPersistenceStrategy({
  type: 'localStorage',
  schema: userPrefsSchema,
});
```

> All strategies implement `PersistenceStrategyBase`.

---

## 🔒 Schema Validation

Each strategy can optionally use a Zod schema for runtime validation:

```ts
createPersistenceStrategy({
  type: 'redis',
  schema: z.object({
    theme: z.enum(['dark', 'light']),
    lastLogin: z.string().optional(),
  }),
});
```

This ensures only valid, typed data is persisted or restored.

---

## 📁 File Structure

```
src/strategies/
├── factory/
│   └── createPersistenceStrategy.ts       # Main factory resolver
├── PersistenceStrategyBase.ts             # Interface definition
└── implementations/
    ├── LocalStorageStrategyImpl.ts
    ├── EncryptedStorageStrategyImpl.ts
    ├── RedisServerStrategyImpl.ts
    ├── FirestoreStrategyImpl.ts
    ├── RestApiStrategyImpl.ts
    └── NavigationStateStrategyImpl.ts
```

---

## 🧠 Strategy Usage via Hook

You typically use a strategy via the `usePersistedFramework` hook:

```ts
const { value, setValue } = usePersistedFramework({
  key: 'user_prefs',
  strategy: createPersistenceStrategy({ type: 'redis', schema }),
});
```

---

## 🔧 Adding New Strategies

1. Create `YourStrategyImpl.ts` in `strategies/implementations/`
2. Implement `PersistenceStrategyBase`
3. Extend `createPersistenceStrategy.ts` to handle your new `type`

---

## ✅ Best Practices

- Use `EncryptedStorageStrategyImpl` for any client-side auth or sensitive data.
- Use `RedisServerStrategyImpl` for fast, ephemeral state (e.g. wizards).
- Use `FirestoreStrategyImpl` or `RestApiStrategyImpl` for durable backend state.
- Pair all strategies with runtime schema validation for safety.

---

## 🔗 Related

- [usePersistedFramework.ts](../hooks/usePersistedFramework.ts)
- [PersistenceStrategyBase.ts](./PersistenceStrategyBase.ts)
- [createPersistenceStrategy.ts](./factory/createPersistenceStrategy.ts)
