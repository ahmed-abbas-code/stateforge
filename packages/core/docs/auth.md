
# Authentication Strategies in StateForge

StateForge provides a modular and pluggable authentication layer with support for both **Firebase Authentication** and **Auth0**. It uses a strategy selector pattern to switch providers at runtime, while exposing a unified `AuthContext` to the application.

---

## 🔐 Supported Providers

### 1. Firebase Authentication

- Uses `firebase` SDK (client and admin)
- Supports email/password, social logins, and custom tokens
- Tokens are validated using `firebase-admin` on the server
- Optional: AES-encrypted local storage for sensitive auth state

### 2. Auth0

- Uses Auth0’s universal login via OAuth 2.0 / OIDC
- Integrates with `@auth0/nextjs-auth0`
- Automatically manages sessions and tokens securely
- No client-side token storage required (uses secure cookies)

---

## 📁 File Structure

```
src/context/auth/
├── AbstractAuthProvider.ts                # Base class for all auth providers
├── FirebaseAuthProviderImpl.tsx           # Firebase-specific implementation
├── Auth0AuthProviderImpl.tsx              # Auth0-specific implementation
├── UnifiedAuthStrategySelector.tsx        # Auto-selects provider based on env
├── AuthContext.tsx                        # React context hook: useAuth()
├── mappers/
│   ├── mapAuth0ToAuthUser.ts              # Normalize Auth0 profile
│   └── mapFirebaseToAuthUser.ts           # Normalize Firebase user
```

---

## 🧠 How It Works

1. `.env.local` defines the provider:

```env
NEXT_PUBLIC_AUTH_STRATEGY=firebase  # or 'auth0'
```

2. `UnifiedAuthStrategySelector` reads the environment and renders the correct provider.
3. All providers implement the same interface exposed by `AbstractAuthProvider`.
4. The app uses `useAuth()` — which is powered by `AuthContext.tsx`.

---

## 🔄 Switching Providers

To switch from Firebase to Auth0:

1. Change `.env.local`:
```env
NEXT_PUBLIC_AUTH_STRATEGY=auth0
```

2. Deploy — no code changes required unless you want to override the default mappers.

---

## 🔒 Security Best Practices

- **Firebase**: Store token in AES-encrypted localStorage (`EncryptedStorageStrategyImpl`)
- **Auth0**: Sessions use `HttpOnly` cookies; no client token exposure
- Tokens are automatically injected into API calls via `axiosClient.ts`

---

## 🔧 Extending

To add another auth provider:
1. Create `YourAuthProviderImpl.tsx`
2. Extend `AbstractAuthProvider`
3. Update `UnifiedAuthStrategySelector.tsx` to handle new strategy
4. Add a user mapper if necessary

---

## 🔗 Related

- [firebase.ts](../lib/firebase.ts)
- [firebase-admin.ts](../lib/firebase-admin.ts)
- [axiosClient.ts](../lib/axiosClient.ts)
- [withAuthValidation.ts](../middleware/withAuthValidation.ts)
