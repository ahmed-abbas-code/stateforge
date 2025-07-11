// src/authentication/client/hooks/useBackendMutation.ts

import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import { mutate as revalidateCache } from 'swr';

import { getTenantId } from '../utils/auth';
import { useAuthContext } from '@authentication/client';

import type {
  RequestBodyPayload,
  UseBackendMutationOptions,
  UseBackendMutationResult,
} from '@authentication/shared';

export type MutationKey = readonly [string, string]; // [path, method]

export function useBackendMutation<TBody = unknown, TRes = unknown>(
  options: UseBackendMutationOptions<TBody, TRes> & {
    invalidate?: MutationKey[];
    auth?: boolean; // ✅ new optional flag
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
    auth = true, // ✅ default to true
  } = options;

  const { handleResponse, getToken } = useAuthContext();
  const key: MutationKey = [path, method];

  const mutationFetcher = async (
    _key: MutationKey,
    { arg }: { arg: TBody }
  ): Promise<TRes> => {
    const token = auth !== false ? await getToken?.() : null; // ✅ skip if auth is false
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

    if (handled.status === 204 || handled.status === 205) {
      if (!handled.ok) throw new Error('Request failed.');
      return undefined as unknown as TRes;
    }

    const json = await handled.json();
    if (!handled.ok) throw json;
    return json;
  };

  const swrCfg: SWRMutationConfiguration<TRes, Error, MutationKey, TBody> = {
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
