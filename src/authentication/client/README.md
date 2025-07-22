# StateForge - Authentication - Client

This package provides a set of custom React hooks and components for managing authentication, API access, and state in a Next.js (or React) application.
All hooks and components are designed for use in a modern SaaS or multi-tenant app with a secure, scalable architecture.

---

## Table of Contents
- [Hooks Overview](#hooks-overview)
- [Authentication Context & Components](#authentication-context--components)
  - [AuthProvider](#authprovider-)
  - [AuthProtection](#authprotection-)
  - [useAuthContext](#useauthcontext)
  - [withAuthProtection](#withauthprotectionhoc)
- [Authentication Hooks](#authentication-hooks)
  - [useAuth](#useauth)
  - [useSignIn](#usesignin)
  - [useSignOut](#usesignout)
- [API & Data Hooks](#api--data-hooks)
  - [useApiFetch](#useapifetch)
  - [useBlobFetch](#useblobfetch)
  - [useBackend](#usebackend)
  - [useBackendMutation](#usebackendmutation)
- [Example Usage](#example-usage)
  - [Usage Examples](./usage.md)
- [License](#license)

---

## Hooks Overview

- **Authentication:** Manage user sign-in/out, access user state, protect routes, and provide app-wide authentication context.
- **API & State:** Securely fetch or mutate backend data, with built-in support for multi-tenancy, auth, error handling, and SWR caching.

---

## Authentication Context & Components

### `<AuthProvider />`

Provides global authentication state and helpers to your React component tree. Handles token management, user state, session expiration, and exposes sign-in/out methods.

**Usage:**

```tsx
import { AuthProvider } from '@authentication/client';

function MyApp({ children }) {
  return (
    <AuthProvider redirectTo="/login">
      {children}
    </AuthProvider>
  );
}
```

- `redirectTo` (required): Path to send unauthenticated users (e.g., `/login`).
- Optionally pass `initialUser` for SSR.

---

### `<AuthProtection />`

Protects a route or component from unauthenticated access. Redirects to a specified location if not authenticated.

**Usage:**

```tsx
import { AuthProtection } from '@authentication/client';

export default function ProtectedPage() {
  return (
    <AuthProtection redirectTo="/login">
      <Dashboard />
    </AuthProtection>
  );
}
```

---

### `withAuthProtection(HOC)`

Wraps a component or page to require authentication.

**Usage:**

```tsx
import { withAuthProtection } from '@authentication/client';
import { useRouter } from 'next/router';

function Dashboard(props) {
  return <div>Private dashboard content</div>;
}

// For Next.js pages, inject the router:
function DashboardPage(props) {
  const router = useRouter();
  return <Dashboard {...props} router={router} />;
}

// Wrap your component/page:
export default withAuthProtection(DashboardPage);
```

- Redirects to `/` if not authenticated.
- Renders nothing while loading.
- The wrapped component **must receive a `router` prop** with a `replace(path)` method (typically from `next/router`).

---

### `useAuthContext()`

Access the authentication context anywhere in your component tree.

**Usage:**

```tsx
import { useAuthContext } from '@authentication/client';

const { user, signIn, signOut, isAuthenticated } = useAuthContext();
```

---

## Authentication Hooks

### `useAuth`

> Get the current authenticated user state, with SWR caching.

**Usage:**

```tsx
const { user, isAuthenticated, isLoading, error } = useAuth();

if (isLoading) return <Spinner />;
if (!isAuthenticated) return <LoginScreen />;
return <Welcome user={user} />;
```

---

### `useSignIn`

> Sign in the user via a backend endpoint (using a previously obtained ID token, e.g. from Firebase Auth).

**Usage:**

```tsx
const signIn = useSignIn();
const handleSignIn = async (idToken: string) => {
  const { ok, error } = await signIn(idToken);
  if (ok) {
    // Proceed to dashboard
  } else {
    // Show sign-in error
  }
};
```

---

### `useSignOut`

> Sign out the user via a backend endpoint. Server is expected to clear HTTP-only cookies.

**Usage:**

```tsx
const signOut = useSignOut();
const handleSignOut = async () => {
  const { ok, error } = await signOut();
  if (ok) {
    // Redirect to login
  } else {
    // Show error
  }
};
```

---

## API & Data Hooks

### `useApiFetch`

> Authenticated fetch with global error handling and JSON parsing.

**Features:**
- Includes credentials
- 401 interception
- Parses JSON, returns text if not JSON
- Optionally returns raw response

**Usage:**

```tsx
const apiFetch = useApiFetch();
const data = await apiFetch('/api/data', { method: 'GET' });
const rawResponse = await apiFetch('/api/data', { raw: true });
```

---

### `useBlobFetch`

> Fetches data as a Blob, with authentication and error handling.

**Usage:**

```tsx
const blobFetch = useBlobFetch();
const fileBlob = await blobFetch('/api/file');
```

---

### `useBackend`

> Fetch backend data with built-in SWR caching, token & tenant support.

**Usage:**

```tsx
const { data, error, isLoading, mutate } = useBackend({
  path: '/api/items',
  refreshInterval: 30000, // poll every 30s
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorComponent />;
return <DataList items={data} />;
```

---

### `useBackendMutation`

> Perform data mutations (POST, PUT, DELETE) with auth, tenant, and SWR cache invalidation.

**Usage:**

```tsx
const mutation = useBackendMutation({
  path: '/api/items',
  method: 'POST',
  onSuccess: (result) => { /* success */ },
  onError: (err) => { /* error */ },
  invalidate: ['/api/items'], // Revalidate this key after mutation
});

await mutation.trigger({ name: 'New Item' });
```

---

## Example Usage

See [Usage Examples →](./usage.md) for real-world implementations of hooks and components.

---

## License

MIT License.
