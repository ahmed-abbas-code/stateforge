// src/authentication/client/hooks/useBackendMutation.ts

import useSWRMutation, {
  SWRMutationConfiguration,
} from 'swr/mutation';
import { mutate as revalidateCache } from 'swr';
import { fetcher } from './useBackend';
import { getAuthToken, getTenantId } from '../utils/auth';
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
    serialize = (body => JSON.stringify(body) as RequestBodyPayload),
    onSuccess,
    onError,
    invalidate,
  } = options;

  const key: MutationKey = [path, method];

  /** Internal SWR fetcher */
  const mutationFetcher = async (
    _key: MutationKey,
    { arg }: { arg: TBody }
  ): Promise<TRes> => {
    const token = getAuthToken();
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
    return fetcher(path, init) as Promise<TRes>;
  };

  /** SWR config with revalidation */
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
