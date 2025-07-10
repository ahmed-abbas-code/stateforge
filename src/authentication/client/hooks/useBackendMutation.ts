// src/authentication/client/hooks/useBackendMutation.ts

import useSWRMutation, {
  SWRMutationConfiguration,
} from 'swr/mutation';
import { mutate as revalidateCache } from 'swr';
import { fetcher } from './useBackend';
import { getAuthToken, getTenantId } from '../utils/auth';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * MutationOptions extends SWR’s mutation config for our
 * [path,method] key, but omits its built-in `revalidate`
 * so we can define our own `revalidateKeys`.
 */
export interface MutationOptions<
  Data = unknown,
  Err = unknown,
  Body = unknown
> extends Omit<
    SWRMutationConfiguration<
      Data,
      Err,
      readonly [string, HttpMethod],
      Body
    >,
    'revalidate'
  > {
  /** 
   * If `true`, revalidate the GET cache at [path, 'GET'].
   * If an array, revalidate each specified cache key.
   */
  revalidateKeys?: boolean | readonly (string | readonly unknown[])[];
  onSuccess?: (data: Data) => void | Promise<void>;
  onError?: (err: Err) => void;
}

/**
 * Centralized mutation hook for backend calls with auth, tenant, and cache invalidation.
 */
export function useBackendMutation<
  Body = unknown,
  Data = unknown,
  Err = unknown
>(
  path: string,
  method: HttpMethod,
  opts: MutationOptions<Data, Err, Body> = {}
): {
  run: (body?: Body) => Promise<Data>;
  loading: boolean;
  error?: Err;
} {
  const { revalidateKeys = true, onSuccess, onError, ...swrCfg } = opts;
  const key = [path, method] as const;

  const mutationFetcher = async (
    _key: typeof key,
    { arg }: { arg: Body }
  ): Promise<Data> => {
    const token = getAuthToken();
    const tenant = getTenantId();
    const init: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(tenant && { 'X-Tenant-Id': tenant }),
      },
      body: arg === undefined ? undefined : JSON.stringify(arg),
    };
    return fetcher(path, init) as Promise<Data>;
  };

  const swrConfig: SWRMutationConfiguration<Data, Err, typeof key, Body> = {
    ...swrCfg,
    onSuccess: async (data, k, cfg) => {
      if (revalidateKeys === true) {
        await revalidateCache([path, 'GET']);
      } else if (Array.isArray(revalidateKeys)) {
        await Promise.all(revalidateKeys.map(k2 => revalidateCache(k2)));
      }
      await onSuccess?.(data);
      await cfg.onSuccess?.(data, k, cfg);
    },
    onError: (err, k, cfg) => {
      onError?.(err);
      cfg.onError?.(err, k, cfg);
    },
  };

  const { trigger, isMutating: loading, error } =
    useSWRMutation<Data, Err, typeof key, Body>(
      key,
      mutationFetcher,
      swrConfig
    );

  // Expose trigger directly as `run` with correct typing
  const run = trigger as (body?: Body) => Promise<Data>;

  return { run, loading, error };
}
