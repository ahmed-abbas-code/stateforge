# StateForge

**StateForge** is a modular, secure framework for building strategy-driven SaaS applications with **Next.js**. It provides unified abstractions for **authentication**, **state persistence**, and **navigation-aware flows**, with full SSR/CSR support.

Designed for extensibility and security, StateForge supports multiple auth providers, client/server persistence backends, and advanced session middleware.

---

## 📦 Monorepo Packages

| Package                 | Description                                                      |
|-------------------------|------------------------------------------------------------------|
| [`@stateforge-framework/core`](./packages/core)      | Core framework: state, persistence, auth, middleware         |
| [`@stateforge-framework/starter`](./packages/starter)| Reference Next.js app demonstrating framework integration     |
| [`create-stateforge-app`](./packages/cli)  | CLI tool for scaffolding new StateForge-based SaaS projects  |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the starter app (dev mode)

```bash
pnpm --filter @stateforge-framework/starter dev
```

### 3. Scaffold a new app

```bash
npx create-stateforge-app my-saas-app
```

---

## 🧠 Architecture Overview

- 🔐 **Pluggable auth**: Firebase or Auth0 (with strategy auto-selection)
- 🔄 **Persistent state strategies**: Redis, Firestore, REST, LocalStorage, Encrypted
- 🔗 **Navigation state**: Step flow memory via context + strategy
- 🛡 **Security middleware**: Rate limiting, auto logout, audit logging, IP guards
- ⚙️ **Runtime validation**: Zod schemas for environment safety
- 💡 **Strategy pattern**: Easily extend persistence or auth logic

---

## 🔧 Monorepo Structure

```
stateforge/
├── packages/
│   ├── core/       # Reusable framework logic
│   ├── starter/    # Example app showing integration patterns
│   └── cli/        # App scaffolding CLI
├── scripts/        # Tree viewer, dry run builders
├── pnpm-workspace.yaml
├── .env.example
└── package.json
```

---

## 🔐 Environment Configuration

Use `.env.local` to define your runtime config. Examples:

```env
NEXT_PUBLIC_AUTH_STRATEGY=firebase

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...

# Auth0
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...

# API backends
BACKEND_APP_API_BASE_URL=https://api.example.com
BACKEND_AUTH_API_BASE_URL=https://auth.example.com

# Encryption
NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET=32-character-secret
```

All variables are validated at runtime via `zod`. Missing or malformed entries will cause a fast failure.

---

## 📁 Show Package Structure

```bash
pnpm run show:core     # Visualize @stateforge-framework/core
pnpm run show:starter  # Visualize the starter app
pnpm run show:cli      # Visualize the CLI tool
```

---

## 🧪 Features Demonstrated in Starter

- ✅ SSR/CSR-compatible shared + navigation state
- ✅ Firebase and Auth0 plug-and-play auth
- ✅ Token-aware Axios clients with auth header injection
- ✅ Dry run builds for preview/CI environments
- ✅ Strategy factory pattern for persistence layers
- ✅ Secure API routes with middleware chaining

---

## 🧰 CLI Tool (`create-stateforge-app`)

Initialize a fully-wired project in seconds:

```bash
npx create-stateforge-app my-app
```

- Prompts for Firebase or Auth0
- Copies `.env` template
- Installs deps & prints setup instructions

Supports local testing via:

```bash
pnpm --filter create-stateforge-app link --global
create-stateforge-app test-app
```

---

## 🔭 Future Plans

- `stateforge-testkit`: Mock strategies for full-state testing
- `stateforge-devtools`: In-browser context + strategy inspector
- `stateforge-vault`: Secure KMS-backed secret storage

---

## 🛠 Scripts

These scripts are available from the root of the `stateforge` monorepo:

| Script                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `pnpm build`             | ⚙️ Build only `core` and `cli` (skips `starter` to avoid requiring secrets) |
| `pnpm build:all`         | 🚀 Build all packages, including `starter` (requires valid `.env.local`)     |
| `pnpm build:starter`     | 🌱 Build only the `starter` app                                              |
| `pnpm build:dryrun`      | 🧪 Build all packages using dry-run env for the starter                     |
| `pnpm dev`               | 🧑‍💻 Start the dev server for `@stateforge-framework/starter`                |
| `pnpm dev:dryrun`        | 🧪 Start dev server with `.env.dryrun` config for safe preview              |
| `pnpm lint`              | 🧹 Lint all workspace packages                                              |
| `pnpm show:core`         | 📂 Show tree structure of `packages/core`                                   |
| `pnpm show:starter`      | 📂 Show tree structure of `packages/starter`                                |
| `pnpm show:cli`          | 📂 Show tree structure of `packages/cli`                                    |
| `pnpm tsc:core`          | 🔍 Type-check `@stateforge-framework/core` using raw `tsc`                  |

> ℹ️ `pnpm build` now excludes the `starter` app to avoid forcing secret environment variables at build time. Use `pnpm build:starter` or `pnpm build:all` if you want to build it explicitly.

---

## 📚 License

MIT — use freely in personal or commercial projects.

---

## 🙌 Maintained by

**[Ahmed Abbas](https://github.com/ahmed-abbas-code)**
