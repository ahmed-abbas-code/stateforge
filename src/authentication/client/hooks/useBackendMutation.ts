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
  Data,
  Err,
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

export function useBackendMutation<
  Body = unknown,
  Data = unknown,
  Err = unknown
>(
  path: string,
  method: HttpMethod,
  opts: MutationOptions<Data, Err, Body> = {}
): {
  run: (arg?: Body) => Promise<Data>;
  loading: boolean;
  error: Err | undefined;
} {
  const {
    revalidateKeys = true,
    onSuccess,
    onError,
    ...swrCfg
  } = opts;

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

  const swrMutationConfig: SWRMutationConfiguration<
    Data,
    Err,
    typeof key,
    Body
  > = {
    ...swrCfg,
    onSuccess: async (data, _k, cfg) => {
      if (revalidateKeys === true) {
        await revalidateCache([path, 'GET']);
      } else if (Array.isArray(revalidateKeys)) {
        await Promise.all(
          revalidateKeys.map(k => revalidateCache(k))
        );
      }
      await onSuccess?.(data);
      await cfg.onSuccess?.(data, _k, cfg);
    },
    onError: (err, _k, cfg) => {
      onError?.(err);
      cfg.onError?.(err, _k, cfg);
    },
  };

  const { trigger, isMutating: loading, error } =
    useSWRMutation<Data, Err, typeof key, Body>(
      key,
      mutationFetcher,
      swrMutationConfig
    );

  const run = (arg?: Body): Promise<Data> => {
    return (trigger as unknown as (arg?: Body) => Promise<Data>)(arg);
  };

  return { run, loading, error };
}
