# create-stateforge-app

A CLI tool to scaffold new projects using the **StateForge** framework — a secure, extensible state and auth layer for modern fullstack applications.

---

## 🚀 Usage

```bash
npx create-stateforge-app my-app
```

You’ll be prompted to select:

- A name for your new app
- The authentication strategy (Firebase / Auth0)

The CLI will:

1. Clone the latest starter template from the StateForge monorepo
2. Set up `.env.local` based on your selection
3. Install dependencies
4. Display post-setup instructions

---

## 🧪 Local Development

To test the CLI locally before publishing:

```bash
cd packages/cli
pnpm install
pnpm link --global
create-stateforge-app my-test-app
```

---

## 📁 Templates

The `/templates` folder includes environment templates:

- `env.firebase` → Firebase config
- `env.auth0` → Auth0 config
- `env.blank` → Minimal config
- `postinstall.md` → Instructions shown after scaffold

---

## 📦 Releasing

To publish:

```bash
cd packages/cli
pnpm publish --access public
```

Ensure the name in `package.json` is `create-stateforge-app` and globally executable.

---

## 📚 License

MIT — use it freely in commercial and personal projects.

## 🙌 Maintained by

Ahmed Abbas
