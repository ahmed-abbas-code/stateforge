// src/authentication/shared/types/Backend.ts

/**
 * Possible request body payload types
 */
export type RequestBodyPayload =
  | string
  | FormData
  | Blob
  | ArrayBuffer
  | URLSearchParams;

/**
 * Options for query hooks
 */
export interface UseBackendOptions {
  /** API endpoint path, may include placeholders like {id} */
  path: string;
  /** Query parameters to serialize */
  params?: Record<string, string | number>;
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** Polling interval in ms; if set, the hook will re-fetch at this interval */
  refreshInterval?: number;
  /** Disable automatic fetching if false */
  enabled?: boolean;
  /** Whether to include Authorization token (default: true) */
  auth?: boolean;
  /** SWR deduping window (default: 2000ms) */
  dedupingInterval?: number;
  /** Whether to revalidate on window focus (default: true) */
  revalidateOnFocus?: boolean;
  /** Whether to revalidate on initial mount (default: true) */
  revalidateOnMount?: boolean;
}

/**
 * Return shape for data-fetching hooks
 */
export interface UseBackendResult<T> {
  /** Fetched data, or null if not yet available */
  data: T | null;
  /** True while the request is in flight or polling */
  isLoading: boolean;
  /** Any error thrown during fetch; callers must narrow the type */
  error: Error | null;
  /**
   * Function to update the cache and optionally revalidate.
   * @param newData New data or promise for optimistic updates
   * @param revalidate Whether to re-fetch after updating (default: true)
   */
  mutate: (newData?: T | Promise<T>, revalidate?: boolean) => Promise<T | undefined>;
}

/**
 * Options for mutation hooks
 */
export interface UseBackendMutationOptions<TBody = unknown, TRes = unknown> {
  /** API endpoint path, may include placeholders like {id} */
  path: string;
  /** HTTP method to use for the mutation (default: POST) */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'GET';
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /**
   * Function to serialize the request body.
   * Default behavior: JSON.stringify(body).
   */
  serialize?: (body: TBody) => RequestBodyPayload;
  /** SWR cache keys to revalidate on success (e.g. ['/clients', '/projects']) */
  invalidateKeys?: string[];
  /** Called after a successful mutation with the returned data */
  onSuccess?: (data: TRes) => void;
  /** Called after a failed mutation with the error thrown */
  onError?: (error: Error) => void;
  /** Whether to include Authorization token (default: true) */
  auth?: boolean;
}

/**
 * Return shape for mutation hooks
 */
export interface UseBackendMutationResult<TArgs = unknown, TRes = unknown> {
  /**
   * Execute the mutation with given arguments.
   * Resolves with the server response.
   */
  mutate: (args: TArgs) => Promise<TRes>;
  /** True while the mutation is in flight */
  isLoading: boolean;
  /** Any error thrown during the mutation; callers must narrow the type */
  error: Error | null;
}
