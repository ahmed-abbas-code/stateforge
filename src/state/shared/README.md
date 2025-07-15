
# StateForge - State - Shared

TypeScript types, contracts, and Zod schemas for global/app state, navigation state, and pluggable persistence in StateForge-based React apps.

---

## Table of Contents
- [Overview](#overview)
- [Modules](#modules)
  - [PersistenceOptions.ts](#persistenceoptionsts)
  - [PersistenceStrategyBase.ts](#persistencestrategybasets)
  - [NavigationState.ts](#navigationstatets)
  - [navigationSchema.ts](#navigationschemats)
  - [AppState.ts](#appstatets)
  - [appStateSchema.ts](#appstateschemats)
- [License](#license)

---

## Overview

These modules define core contracts for persistence strategies, React context state, and runtime validation schemas for navigation and app-wide state.

---

## Modules

### `PersistenceOptions.ts`

**Purpose:**  
Enumerates all supported persistence strategies, and defines their type contract.

**Features:**  
- `STRATEGY_TYPES`: Enum of built-in strategy types (`localStorage`, `firestore`, etc)
- `PersistenceStrategyBase<T>`: contract for pluggable strategies
- `PersistenceStrategy<T>`: can be a type string or a custom object
- `isStrategyIdentifier()`: runtime type guard

**Usage:**

```ts
import { STRATEGY_TYPES, isStrategyIdentifier, PersistenceStrategyBase } from '@state/shared';

function pickStrategy(s: PersistenceStrategyBase<any> | string) {
  if (isStrategyIdentifier(s)) { /* ... */ }
}
```

---

### `PersistenceStrategyBase.ts`

**Purpose:**  
Base interface for all persistence strategies.

**Usage:**

```ts
export class MyCustom implements PersistenceStrategyBase<number> {
  async get(key: string) { /* ... */ }
  async set(key: string, value: number) { /* ... */ }
}
```

---

### `NavigationState.ts`

**Purpose:**  
Types for per-navigation state and its React context.

**Usage:**

```ts
import type { NavigationStateContextType } from '@state/shared';

const { navState, setNavState } = useContext(NavigationStateContext);
```

---

### `navigationSchema.ts`

**Purpose:**  
Zod schema for validating navigation state (step/progress/complete).

**Usage:**

```ts
import { navigationStateSchema } from '@state/shared';

const data = { currentStep: 1, completed: false };
if (!navigationStateSchema.safeParse(data).success) throw new Error('Invalid nav state!');
```

---

### `AppState.ts`

**Purpose:**  
Types for global/app shared state and its React context.

**Usage:**

```ts
import type { AppSharedState, AppStateContextType } from '@state/shared';

const { appSharedState, setAppSharedState } = useContext(AppStateContext);
```

---

### `appStateSchema.ts`

**Purpose:**  
Zod schema for validating core app state (theme, language, sidebar).

**Usage:**

```ts
import { appStateSchema } from '@state/shared';

const state = { theme: 'light', language: 'en', sidebarOpen: true };
if (!appStateSchema.safeParse(state).success) throw new Error('Invalid app state!');
```

---

## License

MIT License.
