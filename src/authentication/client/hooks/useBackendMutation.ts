// src/authentication/client/hooks/useBackendMutation.ts
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import { mutate as revalidateCache } from 'swr';

import { getTenantId } from '../utils/auth';          // token util removed
import { useAuthContext } from '@authentication/client';

import type {
  RequestBodyPayload,
  UseBackendMutationOptions,
  UseBackendMutationResult,
} from '@authentication/shared';

/** Convenience alias for SWR’s key tuple */
export type MutationKey = readonly [string, string]; // [path, method]

export function useBackendMutation<TBody = unknown, TRes = unknown>(
  options: UseBackendMutationOptions<TBody, TRes> & {
    /** Optional list of SWR keys to invalidate (defaults to [path, 'GET']) */
    invalidate?: MutationKey[];
  }
): UseBackendMutationResult<TBody, TRes> {
  const {
    path,
    method = 'POST',
    headers = {},
    serialize = (body) => JSON.stringify(body) as RequestBodyPayload,
    onSuccess,
    onError,
    invalidate,
  } = options;

  const { handleResponse, getToken } = useAuthContext();   // ← central helpers
  const key: MutationKey = [path, method];

  /* ------------------- internal fetcher ------------------- */
  const mutationFetcher = async (
    _key: MutationKey,
    { arg }: { arg: TBody }
  ): Promise<TRes> => {
    const token = await getToken?.();                      // <— unified token
    const tenant = getTenantId();

    const init: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(tenant && { 'X-Tenant-Id': tenant }),
      },
      body: arg === undefined ? undefined : serialize(arg),
    };

    const res = await fetch(path, init);
    const handled = handleResponse ? await handleResponse(res) : res;

    /* 204 / 205 → no body to parse */
    if (handled.status === 204 || handled.status === 205) {
      if (!handled.ok) throw new Error('Request failed.');
      // cast so caller’s generic TRes fits
      return undefined as unknown as TRes;
    }

    const json = await handled.json();
    if (!handled.ok) throw json;
    return json;
  };

  /* ------------------- SWR config ------------------------- */
  const swrCfg: SWRMutationConfiguration<
    TRes,
    Error,
    MutationKey,
    TBody
  > = {
    onSuccess: async (data, _k, cfg) => {
      const keysToInvalidate: MutationKey[] = invalidate ?? [[path, 'GET']];
      for (const key of keysToInvalidate) {
        await revalidateCache(key);
      }
      onSuccess?.(data as TRes);
      cfg.onSuccess?.(data, _k, cfg);
    },
    onError: (err, k, cfg) => {
      onError?.(err as Error);
      cfg.onError?.(err, k, cfg);
    },
  };

  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation<TRes, Error, MutationKey, TBody>(
    key,
    mutationFetcher,
    swrCfg
  );

  return {
    mutate: trigger as (args: TBody) => Promise<TRes>,
    isLoading,
    error: error as Error | null,
  };
}
