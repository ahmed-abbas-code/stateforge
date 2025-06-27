# @stateforge-framework/core

Reusable logic for state, persistence strategies, and auth integrations.

---

## 🧩 What’s Inside

`@stateforge-framework/core` provides the foundational framework logic for:

- ✅ Shared app + navigation state (with SSR hydration)
- ✅ Pluggable persistence strategies (client/server/navigation)
- ✅ Unified authentication strategy (Firebase/Auth0)
- ✅ Secure Axios API clients
- ✅ Runtime schema validation (Zod)
- ✅ Middleware for rate limiting, audit logging, SSO, and more

---

## 🔧 Setup

1. Install dependencies:

```bash
pnpm install @stateforge-framework/core --registry=https://npm.pkg.github.com
```

2. Create your `.env.local`:

```env
NEXT_PUBLIC_AUTH_STRATEGY=firebase
BACKEND_APP_API_BASE_URL=https://api.myapp.com
BACKEND_AUTH_API_BASE_URL=https://auth.myapp.com
```

3. Wrap your app in providers:

```tsx
<UnifiedAuthStrategySelector>
  <AppStateContextProvider>
    <NavigationStateContextProvider>
      <YourApp />
    </NavigationStateContextProvider>
  </AppStateContextProvider>
</UnifiedAuthStrategySelector>
```

---

## 📦 Publishing to GitHub Packages

Publishing is automated via the root `release:core:*` scripts.

1. Ensure your `.env` contains:

   ```env
   GITHUB_TOKEN=your_github_token
   ```

2. Run a release command from the root:

   ```bash
   pnpm release:core:patch
   ```

   Or for full flow including downstream usage:

   ```bash
   pnpm release:core:patch:flow
   ```

This handles `.npmrc` injection, versioning, building, publishing, and swapping to the published version in downstream packages.

---

## 📁 Package Structure

```
src/
├── context/          # Auth, App, and Navigation Contexts
├── hooks/            # usePersistedFramework, useNavigationState
├── lib/              # Axios clients, config loaders, Firebase/Auth
├── middleware/       # Security and session middleware
├── strategies/       # Persistence strategy implementations
├── types/            # Types + Zod schemas
├── utils/            # fetchAppApi, getRequiredEnv
└── index.ts          # Main exports
```

---

## 📚 Documentation

Docs are located in the `docs/` folder:

- [Architecture](./docs/architecture.md)
- [Authentication](./docs/auth.md)
- [Persistence Strategies](./docs/persistence.md)
- [Navigation State](./docs/navigation-state.md)
- [Environment Variables](./docs/environment.md)
- [API Clients](./docs/api-clients.md)
- [Middleware](./docs/middleware.md)
- [Extending the Framework](./docs/extending.md)

---

## 🔗 Related Packages

- [`@stateforge-framework/starter`](https://github.com/stateforge-framework/stateforge/tree/main/packages/starter) – Sample Next.js app using this core
- [`create-stateforge-app`](https://github.com/stateforge-framework/stateforge/tree/main/packages/cli) – CLI scaffolder

---

## 🛠 Scripts

You can run the following scripts from the `@stateforge-framework/core` package root:

| Script            | Description                                                 |
|-------------------|-------------------------------------------------------------|
| `pnpm build`      | Build the project using `tsconfig.build.json`               |
| `pnpm dev`        | Start TypeScript in watch mode for active development       |
| `pnpm tsc`        | Type-check the project without emitting any files           |
| `pnpm lint`       | Run ESLint with autofix on all source files                 |
| `pnpm check:env`  | Validate `.env` using Zod and generate derived config       |
| `pnpm test`       | Run the full test suite using Vitest                        |
| `pnpm test:watch` | Run tests in watch mode with Vitest                         |

These scripts are designed for local development, testing, and CI validation of the core framework module.

---

## 📚 License

MIT — use it freely in commercial and personal projects.

---

## 🙌 Maintained by

**[Ahmed Abbas](https://github.com/ahmed-abbas-code)**
