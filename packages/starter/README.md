# @stateforge/starter

A reference implementation of a Next.js application powered by **@stateforge/core**.

This starter showcases how to build a modern SaaS frontend using StateForge’s modular architecture with support for:
- Pluggable auth providers (Firebase or Auth0)
- Strategy-driven state persistence (local, encrypted, Redis, Firestore, REST)
- Navigation-aware UI flows (e.g., step wizards)
- SSR + CSR-safe state hydration
- Secure, token-aware API routing

---

## 🔧 Getting Started

### 1. Install dependencies (from the monorepo root)

```bash
pnpm install
```

### 2. Configure your environment

Copy and edit the example `.env` file:

```bash
cp .env.example .env.local
```

Then set values such as:

```env
NEXT_PUBLIC_AUTH_STRATEGY=firebase # or 'auth0'
FIREBASE_PROJECT_ID=...
AUTH0_DOMAIN=...
BACKEND_APP_API_BASE_URL=https://api.example.com
BACKEND_AUTH_API_BASE_URL=https://auth.example.com
```

### 3. Start the development server

```bash
pnpm --filter @stateforge/starter dev
```

---

## 📁 Project Structure

```
/pages
  ├── index.tsx            # Entry page using shared state
  ├── sample.tsx           # Step wizard using navigation state
  ├── dashboard.tsx        # Auth-protected page
  ├── _app.tsx             # Global providers setup
  ├── _document.tsx        # Custom document for SSR
  └── /api
      └── /auth
          ├── [...auth0].ts      # Auth0 route handler
          └── firebase.ts        # Firebase login/token validator
      └── /user
          ├── index.ts           # Get current user
          ├── settings.ts        # Persist user settings
          └── secure.ts          # Auth-protected endpoint

/components
  ├── Header.tsx           # Global header with auth info
  ├── BasicStepWizard.tsx  # Example flow using navigation state
  ├── SettingsPanel.tsx    # UI for updating persisted settings
  └── UserProfile.tsx      # Unified view of Firebase/Auth0 user

/src
  ├── hooks/               # Reusable logic (e.g., useSecureData)
  ├── lib/                 # Env patching for dry runs
  ├── styles/              # Global styles (Tailwind/CSS)
  └── utils.ts             # General app utilities

/scripts
  └── build-dryrun.mjs     # Simulates builds without real env secrets
```

---

## 🚀 Features Demonstrated

- ✅ Persistent app + navigation state (with SSR)
- ✅ Pluggable auth strategies (Auth0, Firebase)
- ✅ Redis, Firestore, LocalStorage, and REST-based state strategies
- ✅ Token-aware Axios client with context-based headers
- ✅ Middleware for audit logging, SSO, rate limiting
- ✅ Dynamic flow recovery (e.g., in wizards)
- ✅ Multi-env dry run support for CI or previews

---

## 🧩 Extending This App

You can evolve this app by:

- Creating new `PersistenceStrategyImpl` modules in `@stateforge/core`
- Integrating more backend services using `axiosApp` or `axiosAuth`
- Adding your own providers or shared state contexts
- Using other Next.js features like server components or middleware routing

---

## 📦 Built With

- [@stateforge/core](../core) — framework logic for auth, persistence, and state
- [Next.js](https://nextjs.org) — React-based SSR framework
- [Firebase](https://firebase.google.com) / [Firestore](https://firebase.google.com/products/firestore)
- [Auth0](https://auth0.com) — Identity-as-a-service

---


## 🛠 Scripts

The following scripts are available from the `@stateforge/starter` package root:

| Script               | Description                                                       |
|----------------------|-------------------------------------------------------------------|
| `pnpm dev`           | Start the development server using Next.js                        |
| `pnpm build`         | Build the production version of the app                           |
| `pnpm build:dryrun`  | Build using a dry-run environment for CI or preview environments  |
| `pnpm start`         | Start the production server                                       |
| `pnpm start:dryrun`  | Start using `.env.dryrun` for runtime configuration               |
| `pnpm lint`          | Run lint checks using Next.js ESLint integration                  |


## 📚 License

MIT — open for use in personal, commercial, or client projects.

---

## 🙌 Maintained by

**[Ahmed Abbas](https://github.com/ahmed-abbas-code)**
