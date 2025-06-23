# StateForge

**StateForge** is a secure, modular framework for managing app state, navigation state, and authentication across both client and server.

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
│   ├── core/
│   ├── starter/
│   └── cli/
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
- Modular strategy patterns
- SSR hydration

---

## 🛡 Security Features

- Auth token encryption (AES for Firebase)
- Rate limiting middleware
- Auto logout on token expiration
- Audit logs for login/logout events

---

## ⚙️ Environment Configuration

StateForge uses `.env` files to manage credentials and environment-specific behavior.

### Supported Files:
- `.env.local` — Your working config (never committed)
- `.env.development` — Default for dev
- `.env.production` — Used during build/deploy

### Example:
```env
NEXT_PUBLIC_AUTH_STRATEGY=firebase
BACKEND_APP_API_BASE_URL=https://api.myapp.com
BACKEND_AUTH_API_BASE_URL=https://auth.myapp.com
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

## 📚 License

MIT — use it freely in commercial and personal projects.

---

## 🙌 Maintained by

Ahmed Abbas
