# 📘 StateForge – Client Usage Examples

This guide provides real-world usage examples for each major hook and component from the `@sf/client` package.

---

## 🧩 Setup

Wrap your app with `<AuthProvider />` in `_app.tsx`:

```tsx
import { AuthProvider } from '@authentication/client';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider redirectTo="/login">
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

---

## 🔐 Route Protection

### `AuthProtection` (Component)

```tsx
import { AuthProtection } from '@authentication/client';

export default function DashboardPage() {
  return (
    <AuthProtection redirectTo="/login">
      <Dashboard />
    </AuthProtection>
  );
}
```

---

### `withAuthProtection` (HOC)

```tsx
import { withAuthProtection } from '@authentication/client';
import { useRouter } from 'next/router';

function Dashboard() {
  return <div>Welcome to your dashboard</div>;
}

export default withAuthProtection((props) => {
  const router = useRouter();
  return <Dashboard {...props} router={router} />;
});
```

---

## 👤 Authentication Hooks

### `useAuthContext()`

```tsx
import { useAuthContext } from '@authentication/client';

const Profile = () => {
  const { user, isAuthenticated, signOut } = useAuthContext();

  if (!isAuthenticated) return <p>Please sign in</p>;

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
};
```

---

### `useSignIn()`

```tsx
import { useSignIn } from '@authentication/client';

const Login = () => {
  const signIn = useSignIn();

  const handleLogin = async () => {
    const idToken = await getFirebaseIdToken(); // from Firebase SDK
    const { ok } = await signIn(idToken);

    if (ok) {
      // Redirect or show success
    }
  };

  return <button onClick={handleLogin}>Login</button>;
};
```

---

### `useSignOut()`

```tsx
import { useSignOut } from '@authentication/client';

const LogoutButton = () => {
  const signOut = useSignOut();

  const handleLogout = async () => {
    const { ok } = await signOut();
    if (ok) {
      // Optionally redirect or reset local state
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};
```

---

## 🌐 Backend Integration

### `useApiFetch()`

```tsx
import { useApiFetch } from '@authentication/client';

const UsersList = () => {
  const apiFetch = useApiFetch();

  useEffect(() => {
    const loadUsers = async () => {
      const users = await apiFetch('/api/users');
      console.log(users);
    };
    loadUsers();
  }, []);
};
```

---

### `useBackend()`

```tsx
import { useBackend } from '@authentication/client';

export default function Projects() {
  const { data, isLoading, error } = useBackend({ path: '/projects' });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading projects</p>;

  return (
    <ul>
      {data?.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

---

### `useBackendMutation()`

```tsx
import { useBackendMutation } from '@authentication/client';

export const CreateProject = () => {
  const mutation = useBackendMutation({
    path: '/projects',
    method: 'POST',
    invalidate: ['/projects'],
  });

  const handleCreate = () => {
    mutation.trigger({ name: 'New Project' });
  };

  return <button onClick={handleCreate}>Create</button>;
};
```

---

## ✅ Summary

- Protect routes: `AuthProtection`, `withAuthProtection`
- Auth state: `useAuthContext`
- Sign in/out: `useSignIn`, `useSignOut`
- API fetch: `useApiFetch`, `useBackend`, `useBackendMutation`

---

## 🧪 Tip

Use `AuthProvider` once in your layout or `_app.tsx`, then the hooks and protection tools are available anywhere in the tree.

