
# 🧠 StateForge – State Management Package

Modular, cross-environment state management for scalable Next.js applications. The StateForge state package provides robust shared, client-side, and server-side persistence strategies with pluggable architecture, validation, and React integration.

---

## 🔍 Overview

The StateForge State package is organized into 3 composable packages:

| Package            | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| [`@state/shared`]  | Types, schemas, and strategy contracts for global and navigation state.     |
| [`@state/client`]  | React providers, hooks, and browser storage strategies (local, encrypted).  |
| [`@state/server`]  | Pluggable persistence backends (Firestore, Redis, REST API, etc).           |

---

## 📦 Packages

### [`@state/shared`] – [View Docs →](#stateforge---state---shared)

Includes:
- Contracts for browser/server persistence strategies
- Navigation and app state types
- Zod schemas for validation

Example:
```ts
import { STRATEGY_TYPES, appStateSchema } from '@state/shared';
```

---

### [`@state/client`] – [View Docs →](#stateforge---state---client)

Includes:
- `NavigationStateProvider` and `AppStateProvider`
- Hooks: `useNavigationState`, `useAppState`, `usePersistedFramework`
- Storage strategies: `LocalStorage`, `EncryptedStorage`, `SessionStorage`

Example:
```tsx
const { navState, setNavState } = useNavigationState();
```

---

### [`@state/server`] – [View Docs →](#stateforge---state---server)

Includes:
- Strategy factory to select storage backend dynamically
- Implementations: Redis, Firestore, REST API
- Utility clients: `getRedisClient()`, `firestore`

Example:
```ts
const store = createServerPersistenceStrategy({ type: 'REDIS_SERVER' });
await store.set('user:123', { name: 'Alice' });
```

---

## 🔁 Strategy Architecture

Each strategy conforms to a shared interface:

```ts
interface PersistenceStrategy<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  clear?(key: string): Promise<void>;
}
```

Custom implementations can be plugged in seamlessly.

---

## 🧪 Example Use Cases

- Persist wizard steps or progress state between routes
- Cache form data in session/local storage
- Sync auth/session context with server state
- Store config in Firestore/Redis across users or tenants

---

## 📁 File Structure Reference

| Package       | Key Files                                                                |
|---------------|---------------------------------------------------------------------------|
| `shared`      | `PersistenceOptions.ts`, `AppState.ts`, `navigationSchema.ts`            |
| `client`      | `usePersistedFramework`, `NavigationStateContext`, `EncryptedStorage*`   |
| `server`      | `createServerPersistenceStrategy`, `RedisServerStrategyImpl.ts`          |

---

## 📜 License

MIT License
