
# API Clients in StateForge

StateForge provides robust, secure, and token-aware API clients based on **Axios**. It separates application API calls from authentication flows, supports interceptors, and enables automatic token injection, retries, and environment-based configuration.

---

## 🧩 Why Axios?

- Native support for interceptors (pre/post request handling)
- Full TypeScript support
- Middleware-like architecture
- Easy cancellation, retries, timeouts

---

## 📁 File Structure

```
src/lib/
├── axiosClient.ts             # Core Axios instances and interceptor logic
├── fetchAppApi.ts             # Thin wrapper for app data endpoints
├── withAuthProtection.tsx     # Secures client-side pages with auth
```

---

## 🧠 Axios Instances

StateForge defines two primary Axios clients:

### 1. `axiosApp`

Used for general app-to-backend API calls (e.g., `/user`, `/settings`).

```ts
import { axiosApp } from '@/lib/axiosClient';

const result = await axiosApp.get('/profile');
```

Automatically uses:

- Base URL from `BACKEND_APP_API_BASE_URL`
- `Authorization: Bearer <token>` header
- Retry and error handling

---

### 2. `axiosAuth`

Used for authentication-specific flows (e.g., token refresh, sign-in).

```ts
import { axiosAuth } from '@/lib/axiosClient';

await axiosAuth.post('/token/refresh', { refresh_token });
```

Uses:

- `BACKEND_AUTH_API_BASE_URL`
- Same token logic and retry policies
- Kept logically separate from app logic

---

## 🔒 Token Injection

Auth tokens (from Firebase or Auth0) are injected into each request automatically via request interceptors:

```ts
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 🔁 Retry Strategy

Built-in retry strategy handles:

- Token expiration (auto-logout on failure)
- Network errors
- Server 5xx retries (configurable)

Coming soon: pluggable retry backoff strategy.

---

## 🔧 Example: Custom Hook

```ts
const useUserData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosApp.get('/user/me').then(res => setData(res.data));
  }, []);

  return data;
};
```

---

## 💡 Best Practices

- Use `axiosApp` for general backend logic
- Use `axiosAuth` for login/session/token APIs
- Avoid using `fetch` directly unless scoped to a specific edge case
- Interceptors are shared across all requests

---

## 🔗 Related

- [axiosClient.ts](../lib/axiosClient.ts)
- [config.ts](../lib/config.ts)
- [fetchAppApi.ts](../utils/fetchAppApi.ts)
- [AuthContext.tsx](../context/auth/AuthContext.tsx)
