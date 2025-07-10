// src/authentication/server/middleware/auth-headers.ts

/**
 * Retrieves authorization headers for API requests.
 * Adjust implementation to match your auth storage strategy (e.g., cookies, localStorage, context).
 */
export function getAuthHeaders(): Record<string, string> {
  // Example uses JWT stored in localStorage
  const token = localStorage.getItem("authToken");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}