// src/authentication/client/hooks/useBackendMutation.ts

import useSWRMutation from 'swr/mutation';
import { mutate as revalidateCache } from 'swr';
import { fetcher } from './useBackend';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface MutationOptions<Data, Err> {
  /**
   * true  – revalidate every key that begins with `path` (default)  
   * string[] – list of specific cache keys to revalidate  
   * false – skip revalidation
   */
  revalidate?: boolean | string[];
  onSuccess?: (data: Data) => void | Promise<void>;
  onError?: (err: Err) => void;
}

/**
 * Shared mutation hook for POST / PUT / PATCH / DELETE calls.
 *
 * @template Body  Request payload type
 * @template Data  Successful response type
 * @template Err   Error object returned by the backend
 */
export function useBackendMutation<
  Body = unknown,
  Data = unknown,
  Err = unknown
>(
  path: string,
  method: HttpMethod,
  opts: MutationOptions<Data, Err> = {}
) {
  const {
    revalidate: revalidateOpt = true,
    onSuccess,
    onError,
    ...swrCfg
  } = opts;

  /* ---------- SWR set-up ---------- */

  // Stable key for this mutation; type is literal tuple
  const key = [path, method] as const;

  // Network request; SWR passes `Body` as arg
  const mutationFetcher = async (
    _key: typeof key,
    { arg }: { arg: Body }
  ): Promise<Data> => {
    const init: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: arg === undefined ? undefined : JSON.stringify(arg),
    };
    return fetcher(path, init) as Promise<Data>;
  };

  const { trigger, isMutating: loading, error } = useSWRMutation<
    Data,          // Data
    Err,           // Error
    typeof key,    // Key
    Body           // ExtraArg (payload)
  >(key, mutationFetcher, {
    ...swrCfg,
    onSuccess: async (data, k, cfg) => {
      // Default cache-invalidator
      if (revalidateOpt === true) {
        revalidateCache((cacheKey: unknown) =>
          typeof cacheKey === 'string' && cacheKey.startsWith(path)
        );
      } else if (Array.isArray(revalidateOpt)) {
        await Promise.all(revalidateOpt.map(k2 => revalidateCache(k2)));
      }

      await onSuccess?.(data);
      cfg?.onSuccess?.(data, k, cfg);
    },
    onError: (err, k, cfg) => {
      onError?.(err);
      cfg?.onError?.(err, k, cfg);
    },
  });

  /* ---------- Union-narrowing helper ---------- */
  type TriggerFn = (arg: Body) => Promise<Data>;
  const callTrigger: TriggerFn = trigger as unknown as TriggerFn;

  /* ---------- Public API ---------- */
  const run = (body: Body): Promise<Data> => callTrigger(body);

  return { run, loading, error };
}
