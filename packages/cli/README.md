# create-stateforge-app

A CLI tool to scaffold new SaaS apps using **StateForge** — a modular, secure state + auth framework built for Next.js.

This CLI jumpstarts development by wiring up:
- ✅ Pluggable auth providers (Firebase or Auth0)
- ✅ Strategy-based persistence (LocalStorage, Redis, Firestore, REST)
- ✅ Environment bootstrapping with runtime-safe defaults
- ✅ A working example app built on `@stateforge/core`

---

## 🚀 Getting Started

Use via `npx`:

```bash
npx create-stateforge-app my-app
```

You’ll be prompted to choose:
- A project name
- An authentication strategy: **Firebase** or **Auth0**

The CLI will then:
1. Create a new folder for your project
2. Copy a pre-wired app template (based on `@stateforge/starter`)
3. Apply the corresponding `.env` file (`env.firebase` or `env.auth0`)
4. Run `pnpm install`
5. Print post-setup guidance from `postinstall.md`

---

## 🧪 Local Development

To test the CLI locally:

```bash
cd packages/cli
pnpm install
pnpm link --global

create-stateforge-app my-test-app
```

Use the generated app as a full-featured playground for `@stateforge/core`.

---

## 📁 Templates

Environment templates live in the `/templates` directory:

- `env.firebase` — For Firebase auth and Firestore state
- `env.auth0` — For Auth0 auth with external API state
- `env.blank` — Barebones for custom strategy use
- `postinstall.md` — Instructions displayed after generation

These templates map directly to supported configurations in the `@stateforge/starter` app.

---

## 📦 Build & Release

The CLI is bundled with [`tsup`](https://tsup.egoist.dev) and published to npm.

To release:

```bash
cd packages/cli
pnpm build
pnpm publish --access public
```

Make sure `package.json` includes:
```json
"bin": {
  "create-stateforge-app": "bin/index.js"
}
```

And that `bin/index.js` has a shebang (auto-injected by `inject-shebang.js`).

---

## 📚 Related Packages

- [`@stateforge/core`](../core) – Framework logic for auth, state, and persistence
- [`@stateforge/starter`](../starter) – Fully wired reference implementation

---


## 🛠 Scripts

The following scripts are available from the `create-stateforge-app` package root:

| Script         | Description                                                   |
|----------------|---------------------------------------------------------------|
| `pnpm dev`     | Run the CLI in development mode using `tsx`                   |
| `pnpm build`   | Bundle the CLI using `tsup` and inject the shebang line       |
| `pnpm start`   | Execute the built CLI entry file (`dist/index.js`) manually   |


## 📚 License

MIT — open for commercial and personal use.

---

## 🙌 Maintained by

**[Ahmed Abbas](https://github.com/ahmed-abbas-code)**
