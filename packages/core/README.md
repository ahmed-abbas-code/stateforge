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

## 🔧 Setup (for consuming projects)

1. **Configure `.npmrc`** (required even for public packages):

   ```ini
   # .npmrc (project root)

   @stateforge-framework:registry=https://npm.pkg.github.com
   ```

   > ✅ This tells npm/pnpm to fetch **only** `@stateforge‑framework/*` packages from GitHub, while everything else continues to come from the default npm registry.

2. **Install the package**:

   ```bash
   pnpm install @stateforge-framework/core
   ```

3. **Create your `.env.local`**:

   ```env
   NEXT_PUBLIC_AUTH_STRATEGY=firebase
   BACKEND_APP_API_BASE_URL=https://api.myapp.com
   BACKEND_AUTH_API_BASE_URL=https://auth.myapp.com
   ```

4. **Wrap your app in providers**:

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

## 🛠️ .npmrc Configuration Details

### Public packages — **no token needed**

If the package you’re consuming is **public**, the single‑line `.npmrc` above is all you need.<br>
Keep the file *token‑free*:

```ini
@stateforge-framework:registry=https://npm.pkg.github.com
```

### Private packages / CI pipelines — **token required**

For private packages or when installing in CI:

```ini
@stateforge-framework:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

| Environment                 | How to set `GITHUB_TOKEN`                                                |
|-----------------------------|--------------------------------------------------------------------------|
| macOS / Linux (bash/zsh)    | `export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxx"`                       |
| Windows (PowerShell)        | `$Env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxxx"`                       |
| GitHub Actions              | `env:`<br>`  GITHUB_TOKEN: ${{ secrets.MY_PAT }}`                       |
| `.env` + direnv / dotenv    | `echo "GITHUB_TOKEN=ghp_xxx" >> .env`                                   |

The token needs **`read:packages`** (and `write:packages` if you publish).  
After exporting the variable, open a new terminal *(or `source ~/.zshrc` / run `RefreshEnv`)* so the shell recognizes it.

---

## 📦 Publishing to GitHub Packages

Publishing is automated via the root `release:core:*` scripts.

1. Ensure your CI or local environment exports `GITHUB_TOKEN` with `write:packages`.
2. Run a release command from the repo root:

   ```bash
   pnpm release:core:patch
   ```

   or

   ```bash
   pnpm release:core:patch:flow
   ```

This script injects `.npmrc`, bumps version, builds, publishes, and updates downstream packages.

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

| Script            | Description                                                 |
|-------------------|-------------------------------------------------------------|
| `pnpm build`      | Build the project using `tsconfig.build.json`               |
| `pnpm dev`        | Start TypeScript in watch mode for active development       |
| `pnpm tsc`        | Type‑check the project without emitting files               |
| `pnpm lint`       | Run ESLint with autofix on all source files                 |
| `pnpm check:env`  | Validate `.env` using Zod and generate derived config       |
| `pnpm test`       | Run the full test suite with Vitest                         |
| `pnpm test:watch` | Run tests in watch mode with Vitest                         |

---

## 📚 License

MIT — use it freely in commercial and personal projects.

---

## 🙌 Maintained by

**[Ahmed Abbas](https://github.com/ahmed-abbas-code)**
