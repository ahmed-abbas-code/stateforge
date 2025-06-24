# @stateforge/starter

A reference implementation of a Next.js application using the **StateForge Core Framework**.

This starter demonstrates:
- Persistent shared and client-side state
- Secure multi-strategy state hydration (SSR + CSR)
- Unified Auth context via Firebase or Auth0
- Modular persistence via Redis, Firestore, REST API, or localStorage
- Navigation state persistence across route changes
- Sample UI flows (step wizards, settings panels, protected routes)

---

## 🔧 Getting Started

### 1. Install dependencies (from monorepo root)

```bash
pnpm install
```

### 2. Set up your `.env.local` file

```bash
cp .env.example .env.local
```

Update required values:
- `FIREBASE_PROJECT_ID=...`
- `AUTH0_DOMAIN=...`
- `BACKEND_APP_REST_API_BASE_URL=...`
- `BACKEND_AUTH_REST_API_BASE_URL=...`

### 3. Run the dev server

```bash
pnpm --filter @stateforge/starter dev
```

---

## 📁 Structure Overview

```txt
/pages
  ├── index.tsx                  # Shared + client state example
  ├── sample.tsx                 # Wizard with SSR navigation state
  ├── _app.tsx                   # Loads global providers
  ├── _document.tsx              # HTML structure and preload setup
  └── /api
      ├── [...auth0].ts          # Auth0 handler route
      ├── secure-data.ts         # Protected Firebase-auth API route
      └── /user/                 # App-specific backend routes

/components
  ├── SettingsPanel.tsx          # Sample persisted settings UI
  ├── SampleStepWizard.tsx       # Wizard steps with SSR + navigation state
  └── UserProfile.tsx            # Reads from unified AuthContext
```

---

## 🚀 Features Demonstrated

- ✅ SSR-safe state hydration
- ✅ Navigation state persistence
- ✅ Redis & Firestore integration
- ✅ Dual-mode Auth (Firebase/Auth0)
- ✅ Global token-aware Axios wrapper
- ✅ Protected routes via middleware
- ✅ Step wizard with recovery and restart
- ✅ Environment-aware API switching (staging, prod)

---

## 🧩 Extend This Starter

You can build on this by:
- Adding your own `PersistenceStrategyImpl` subclasses
- Connecting to your own APIs via `axiosApp` or `axiosAuth`
- Replacing or wrapping the default `AppProvider`/`AuthProvider`

---

## 📦 Based On

- [@stateforge/core](https://github.com/ahmed-abbas-code/stateforge) (in monorepo)
- [Next.js](https://nextjs.org)
- [Firebase / Firestore](https://firebase.google.com)
- [Auth0](https://auth0.com)

---

## 📚 License

MIT — use it freely in commercial and personal projects.

---

## 🙌 Maintained by

Ahmed Abbas