
# StateForge - State - Shared

A set of client/browser state and persistence tools for StateForge apps: context providers, hooks, and pluggable strategies for storing state in localStorage, navigation/session storage, or with encryption.

---

## Table of Contents
- [Overview](#overview)
- [Modules](#modules)
  - [createBrowserPersistenceStrategy.ts](#createbrowserpersistencestrategyts)
  - [EncryptedStorageStrategyImpl.ts](#encryptedstoragestrategyimplts)
  - [NavigationStateStrategyImpl.ts](#navigationstatestrategyimplts)
  - [LocalStorageStrategyImpl.ts](#localstoragestrategyimplts)
  - [NavigationStateContext.tsx](#navigationstatecontexttsx)
  - [AppStateContext.tsx](#appstatecontexttsx)
  - [useAppState.ts](#useappstatets)
  - [useNavigationState.ts](#usenavigationstatets)
  - [useNavigationPersistedState.ts](#usenavigationpersistedstatets)
  - [usePersistedFramework.ts](#usepersistedframeworkts)
- [License](#license)

---

## Overview

These modules provide React context providers, hooks, and persistence strategies for client/browser state:
- Store state in localStorage, navigation/session storage, or with encryption
- Easily access app-wide or navigation state via React context
- Persist form or wizard progress, UI state, or any serializable data

---

## Modules

### `createBrowserPersistenceStrategy.ts`

**Purpose:**  
A factory to select and instantiate the right browser-side persistence strategy (`localStorage` or `navigationState`).

**Usage:**

```ts
import { createBrowserPersistenceStrategy } from '@state/client';

const store = createBrowserPersistenceStrategy('localStorage', 'myApp');
await store.set('key', { foo: 'bar' });
const value = await store.get('key');
```

---

### `EncryptedStorageStrategyImpl.ts`

**Purpose:**  
Client-side storage strategy that encrypts values before saving to localStorage.

**Usage:**

```ts
import { EncryptedStorageStrategyImpl } from '@state/client';

const secureStore = new EncryptedStorageStrategyImpl('auth');
await secureStore.set('token', { jwt: 'abc123' });
const token = await secureStore.get('token');
```

---

### `NavigationStateStrategyImpl.ts`

**Purpose:**  
Stores navigation state in sessionStorage (browser) or in-memory (SSR).

**Usage:**

```ts
import { NavigationStateStrategyImpl } from '@state/client';

const navState = new NavigationStateStrategyImpl('wizard');
await navState.set('step', 2);
const step = await navState.get('step');
```

---

### `LocalStorageStrategyImpl.ts`

**Purpose:**  
Stores key/value data in localStorage, with namespacing.

**Usage:**

```ts
import { LocalStorageStrategyImpl } from '@state/client';

const store = new LocalStorageStrategyImpl('profile');
await store.set('user', { name: 'Alice' });
const user = await store.get('user');
```

---

### `NavigationStateContext.tsx`

**Purpose:**  
React context/provider for navigation state (e.g. wizard step), resets state on route changes.

**Usage:**

```tsx
import { NavigationStateProvider, NavigationStateContext } from '@state/client';

<NavigationStateProvider router={router}>
  <App />
</NavigationStateProvider>

// In component:
const { navState, setNavState } = useContext(NavigationStateContext);
```

---

### `AppStateContext.tsx`

**Purpose:**  
React context/provider for app-wide shared state (e.g. hydration, timestamps).

**Usage:**

```tsx
import { AppStateProvider, AppStateContext } from '@state/client';

<AppStateProvider>
  <App />
</AppStateProvider>

// In component:
const { appSharedState, setAppSharedState } = useContext(AppStateContext);
```

---

### `useAppState.ts`

**Purpose:**  
Custom hook to access app-wide state/context.

**Usage:**

```ts
import { useAppState } from '@state/client';

const { appSharedState, setAppSharedState } = useAppState();
```

---

### `useNavigationState.ts`

**Purpose:**  
Custom hook to access navigation state/context.

**Usage:**

```ts
import { useNavigationState } from '@state/client';

const { navState, setNavState } = useNavigationState();
```

---

### `useNavigationPersistedState.ts`

**Purpose:**  
Hook for per-route persisted state, using sessionStorage (default). Supports auto-clear on navigation.

**Usage:**

```ts
import { useNavigationPersistedState } from '@state/client';

const [value, setValue] = useNavigationPersistedState({
  key: 'wizard-step',
  defaultValue: 1,
  clearOnLeave: true,
  router,
});
```

---

### `usePersistedFramework.ts`

**Purpose:**  
Flexible hook for persisted state using any supported strategy (localStorage, navigationState, or custom).

**Usage:**

```ts
import { usePersistedFramework } from '@state/client';

const [theme, setTheme] = usePersistedFramework({
  key: 'theme',
  defaultValue: 'light',
  strategy: 'localStorage', // or 'navigationState', or a custom strategy instance
  namespace: 'app',
});
```

---

## License

MIT License.
