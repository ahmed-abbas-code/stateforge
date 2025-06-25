
# Navigation State in StateForge

**Navigation state** in StateForge refers to transient, per-page or per-flow state that should persist across page reloads or SSR hydration — but doesn't need to be saved permanently (e.g., multi-step forms, wizards, filters).

---

## 🎯 Purpose

- Keep state alive between page transitions
- Hydrate state after SSR reload
- Avoid storing temporary state in long-lived storage (like Redis or Firestore)

---

## 🧠 Where It’s Used

- Step-based onboarding flows
- Multi-tab dashboards with remembered filters
- Modal or drawer states across routing changes

---

## 🗂 Strategy: `NavigationStateStrategyImpl`

This strategy uses in-memory or session-level storage to retain values temporarily during the user's session.

### Example Usage

```ts
const navigationStrategy = createPersistenceStrategy({
  type: 'navigation',
  schema: wizardStepSchema
});

const { value, setValue } = usePersistedFramework({
  key: 'onboarding_wizard',
  strategy: navigationStrategy
});
```

---

## 🔁 SSR Hydration Support

StateForge auto-hydrates navigation state when using Next.js or SSR-compatible renderers.

### Implementation File

```ts
src/context/state/NavigationStateContext.tsx
```

This context:
- Provides `useNavigationPersistedState()` hook
- Uses sessionStorage or memory fallback
- Cleans up on route change if configured

---

## 🔧 Hook API

### `useNavigationPersistedState<T>()`

```ts
const { value, setValue } = useNavigationPersistedState<T>({
  key: 'wizard_step',
  defaultValue: { step: 1 },
  schema: z.object({ step: z.number() })
});
```

---

## 💡 Best Practices

- Always provide a validation schema
- Do not use navigation state for secure or sensitive data
- Use this strategy for volatile, flow-scoped values only

---

## 🔁 Cleanup on Page Leave

Optional: You can enable cleanup by watching for `beforeunload` or `router.events` in Next.js to clear transient state.

---

## 🔗 Related

- [NavigationStateStrategyImpl.ts](../strategies/implementations/NavigationStateStrategyImpl.ts)
- [useNavigationPersistedState.ts](../hooks/useNavigationPersistedState.ts)
- [NavigationStateContext.tsx](../context/state/NavigationStateContext.tsx)
