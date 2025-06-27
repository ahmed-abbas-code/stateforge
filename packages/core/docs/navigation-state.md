# Navigation State in StateForge

**Navigation state** refers to transient, session-scoped values that persist across page reloads or routing changes — but are not saved long-term. It's ideal for flow-specific UX like wizards, modals, and filter state.

---

## 🎯 Purpose

- Retain state across SSR hydration and route transitions
- Avoid using persistent storage (Redis, Firestore) for ephemeral flows
- Enable multi-step forms, onboarding, or dashboard tab filters

---

## 📦 Strategy: `NavigationStateStrategyImpl`

Implements a volatile, in-memory/sessionStorage-based persistence strategy.

```ts
const navigationStrategy = createPersistenceStrategy({
  type: 'navigation',
  schema: wizardStepSchema,
});
```

---

## 🔧 Hook: `useNavigationPersistedState<T>()`

Used to bind navigation state to a key and Zod schema.

```ts
const { value, setValue } = useNavigationPersistedState<T>({
  key: 'wizard_step',
  defaultValue: { step: 1 },
  schema: z.object({ step: z.number() }),
});
```

- Auto-hydrates from sessionStorage (or memory fallback)
- Persists on route changes without long-term storage
- Supports SSR-safe access

---

## 🧠 Implementation

- Context: `NavigationStateContext.tsx`
- Strategy: `NavigationStateStrategyImpl.ts`
- Hook: `useNavigationPersistedState.ts`

```ts
<NavigationStateProvider>
  <YourComponent />
</NavigationStateProvider>
```

---

## 🧼 Cleanup on Page Leave

Optionally clear transient state on navigation:

```ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';

useEffect(() => {
  const handleRouteChange = () => clearYourState();

  router.events.on('routeChangeStart', handleRouteChange);
  return () => router.events.off('routeChangeStart', handleRouteChange);
}, []);
```

---

## 🧠 Best Practices

- Always validate navigation state using a schema
- Use for flow-specific, UI-scoped data only
- Never store sensitive data in navigation state
- Clean up explicitly on critical route changes

---

## 🗂 File Structure

```
src/
├── strategies/implementations/NavigationStateStrategyImpl.ts
├── context/state/NavigationStateContext.tsx
└── hooks/useNavigationPersistedState.ts
```

---

## 🔗 Related

- [NavigationStateStrategyImpl.ts](../strategies/implementations/NavigationStateStrategyImpl.ts)
- [NavigationStateContext.tsx](../context/state/NavigationStateContext.tsx)
- [useNavigationPersistedState.ts](../hooks/useNavigationPersistedState.ts)