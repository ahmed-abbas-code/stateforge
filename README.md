# StateForge

**StateForge** is a secure, modular framework for managing app state, navigation state, and authentication across both client and server.

It supports pluggable strategies for persistence, authentication (Firebase/Auth0), navigation state hydration, and encrypted storage. Built with extensibility and production security in mind.

---

## 📦 Monorepo Packages

| Package                 | Description                                 |
|-------------------------|---------------------------------------------|
| `@stateforge/core`      | Core framework logic and abstractions       |
| `@stateforge/starter`   | Full Next.js starter app using the core     |
| `create-stateforge-app` | CLI tool to scaffold new projects           |

---

## 🚀 Getting Started

### 1. Install all dependencies

```bash
pnpm install
```

### 2. Start the development server (starter package)

```bash
pnpm dev
```

### 3. Build all packages

```bash
pnpm build
```

---

## 🔧 Workspace Configuration

This monorepo uses **pnpm workspaces**:

```
stateforge/
├── packages/
│   ├── core/       # Reusable framework
│   ├── starter/    # Sample Next.js app
│   └── cli/        # CLI scaffolder
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## 🛠 Technologies Used

- TypeScript
- React / Next.js
- Firebase / Auth0
- Axios (with interceptors)
- Redis / Firestore
- Modular strategy pattern
- SSR hydration

---

## 🛡 Security Features

- AES-encrypted tokens (for Firebase)
- Rate limiter middleware
- Auto logout on token expiration
- Audit logs on login/logout events
- SSO extensions for Auth0 & Firebase

---

## ⚙️ Environment Configuration

StateForge uses `.env` files to manage credentials and environment-specific behavior.

### Supported Files

- `.env.local` — Your working config (never committed)
- `.env.development` — Defaults for dev
- `.env.production` — Used during build/deploy

### Example

```env
NEXT_PUBLIC_AUTH_STRATEGY=firebase

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Auth0
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...

# REST endpoints
BACKEND_APP_API_BASE_URL=https://api.myapp.com
BACKEND_AUTH_API_BASE_URL=https://auth.myapp.com

# Encryption
NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET=your-32-char-secret
```

---

## ✅ Runtime Validation with `zod`

All environment variables are validated at runtime using `zod`.

If any variable is missing or malformed, the app will **fail fast** with an error message.

### Example Usage

```ts
import { env } from '@/lib/envConfig';

const apiBase = env.BACKEND_APP_API_BASE_URL;
```

---

## 📁 File Tree Commands

Show package structures from the root:

```bash
pnpm run show:core     # Lists files in core
pnpm run show:starter  # Lists files in starter
pnpm run show:cli      # Lists files in CLI
```

---

## 🧪 Planned Extensions

- `stateforge-testkit`: Mock strategies for testing
- `stateforge-devtools`: In-browser state inspector
- `stateforge-vault`: Plugin for secrets storage via cloud KMS

---

## 📚 License

MIT — use it freely in commercial and personal projects.

---

## 🙌 Maintained by

**Ahmed Abbas**