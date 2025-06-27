# Authentication in StateForge

StateForge provides a unified, strategy-based authentication system with support for **Firebase Authentication** and **Auth0**. It uses a runtime strategy selector and abstract provider base to offer a consistent `AuthContext` API across different identity providers.

---

## 🔐 Supported Authentication Strategies

### 1. **Firebase Authentication**

- Uses `firebase` and `firebase-admin` SDKs
- Supports email/password, social, and custom auth
- Token validation via Firebase Admin on the server
- Optional encrypted storage for tokens on the client

### 2. **Auth0**

- Uses `@auth0/nextjs-auth0`
- Provides secure OAuth/OIDC login via universal login
- Stores session in HttpOnly cookies
- No client-side token exposure

---

## 🧠 Unified API

All auth providers implement the same interface defined by `AbstractAuthProvider`.

The app consumes a unified context via:

```ts
import { useAuth } from '@/context/auth/AuthContext';

const { user, login, logout } = useAuth();
```

---

## 🧩 Strategy Selection

StateForge auto-selects the correct auth strategy at runtime using:

```env
NEXT_PUBLIC_AUTH_STRATEGY=firebase  # or 'auth0'
```

The selector component:

```tsx
// UnifiedAuthStrategySelector.tsx
switch (strategy) {
  case 'firebase': return <FirebaseAuthProviderImpl>{children}</FirebaseAuthProviderImpl>;
  case 'auth0': return <Auth0AuthProviderImpl>{children}</Auth0AuthProviderImpl>;
}
```

---

## 🔁 Switching Providers

To switch between Firebase and Auth0:

1. Update `.env.local`:
```env
NEXT_PUBLIC_AUTH_STRATEGY=auth0
```

2. Redeploy. No code changes are needed if the mappers and providers follow the shared interface.

---

## 🔧 File Structure

```
src/context/auth/
├── AbstractAuthProvider.ts                # Shared interface
├── FirebaseAuthProviderImpl.tsx           # Firebase implementation
├── Auth0AuthProviderImpl.tsx              # Auth0 implementation
├── UnifiedAuthStrategySelector.tsx        # Auto-switch logic
├── AuthContext.tsx                        # Global hook interface
└── mappers/
    ├── mapFirebaseToAuthUser.ts
    └── mapAuth0ToAuthUser.ts
```

---

## 🛡 Security Considerations

| Provider | Client Token Storage | Session Handling          |
|----------|----------------------|---------------------------|
| Firebase | Encrypted localStorage (optional) | Firebase Admin SDK on server |
| Auth0    | None (secure cookies)           | Auth0 session cookies         |

- All tokens are injected into requests via Axios interceptors
- Use `EncryptedStorageStrategyImpl` for sensitive state if using Firebase
- Auth0 relies on cookie/session middleware from `@auth0/nextjs-auth0`

---

## ➕ Adding a Custom Provider

To extend with your own auth provider:

1. Create `MyAuthProviderImpl.tsx` and extend `AbstractAuthProvider`
2. Implement all required methods (login, logout, getUser, etc.)
3. Add a new case to `UnifiedAuthStrategySelector.tsx`
4. Optionally create a mapper to normalize user data

---

## 🔗 Related

- [axiosClient.ts](../lib/axiosClient.ts)
- [firebase.ts](../lib/firebase.ts)
- [firebase-admin.ts](../lib/firebase-admin.ts)
- [withAuthValidation.ts](../middleware/withAuthValidation.ts)