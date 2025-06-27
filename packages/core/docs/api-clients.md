# API Clients in StateForge

StateForge provides secure, environment-aware, token-injecting API clients built on **Axios**. These clients streamline authenticated communication with both app and auth backends, supporting interceptors, retries, and automatic logout on session failure.

---

## 🚀 Why Axios?

- Native support for request/response interceptors
- TypeScript-first support
- Middleware-like behavior
- Easily supports retries, cancellations, and timeouts

---

## 📁 File Structure

```
src/lib/
├── axiosClient.ts             # Base Axios instance setup and interceptors
├── fetchAppApi.ts             # Wrapper for app-specific requests
├── withAuthProtection.tsx     # HOC to secure client pages with auth
```

---

## 🧠 Axios Instances

StateForge defines two main Axios clients:

### 1. `axiosApp`

Used for general application API calls, such as `/profile`, `/settings`, etc.

```ts
import { axiosApp } from '@/lib/axiosClient';

const result = await axiosApp.get('/user/me');
```

**Features:**
- Reads base URL from `BACKEND_APP_API_BASE_URL`
- Automatically injects `Authorization: Bearer <token>`
- Retry logic with failure handling

---

### 2. `axiosAuth`

Used for auth-related endpoints like login, refresh, and logout.

```ts
import { axiosAuth } from '@/lib/axiosClient';

await axiosAuth.post('/token/refresh', { refresh_token });
```

**Features:**
- Reads base URL from `BACKEND_AUTH_API_BASE_URL`
- Shares token handling/interceptors with `axiosApp`
- Isolated from app-specific logic

---

## 🔐 Token Injection

Tokens (from Firebase or Auth0) are injected automatically:

```ts
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getAuthToken(); // Unified token retriever
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 🔁 Retry and Error Handling

Includes:

- Auto-retry on transient errors (network, 5xx)
- Auto-logout on 401/403 (token expiry or revocation)
- Optional backoff strategy (coming soon)

---

## 🧪 Example Hook

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

- Use `axiosApp` for business logic endpoints
- Use `axiosAuth` for session/token-related calls
- Avoid raw `fetch` unless explicitly required
- Share interceptors for consistency
- Wrap API errors and expose via app state where possible

---

## 🔗 Related Files

- [`axiosClient.ts`](../lib/axiosClient.ts)
- [`config.ts`](../lib/config.ts)
- [`fetchAppApi.ts`](../utils/fetchAppApi.ts)
- [`AuthContext.tsx`](../context/auth/AuthContext.tsx)