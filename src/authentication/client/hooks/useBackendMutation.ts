// src/authentication/client/hooks/useBackendMutation.ts

import useSWRMutation, {
  SWRMutationConfiguration,
} from 'swr/mutation';
import { mutate as revalidateCache } from 'swr';
import { fetcher } from '@authentication/client';
import { getAuthToken, getTenantId } from '../utils/auth';

import { RequestBodyPayload, UseBackendMutationOptions, UseBackendMutationResult } from '@authentication/shared';

/** Convenience alias for SWR’s key tuple */
type MutationKey = readonly [string, string]; // [path, method]

/**
 * Centralized mutation hook for backend calls with auth & tenant headers.
 * Matches UseBackendMutationOptions / UseBackendMutationResult shape.
 */
export function useBackendMutation<TBody = unknown, TRes = unknown>(
  options: UseBackendMutationOptions<TBody, TRes>
): UseBackendMutationResult<TBody, TRes> {
  const {
    path,
    method = 'POST',
    headers = {},
    serialize = JSON.stringify as (body: TBody) => RequestBodyPayload,
    onSuccess,
    onError,
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

  /** SWR config (no revalidateKeys concept now; handle in onSuccess) */
  const swrCfg: SWRMutationConfiguration<
    TRes,
    Error,
    MutationKey,
    TBody
  > = {
    onSuccess: async (data, k, cfg) => {
      // Default behavior: revalidate the corresponding GET cache
      await revalidateCache([path, 'GET']);
      await onSuccess?.(data as TRes);
      cfg.onSuccess?.(data, k, cfg);
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

  // Conform to UseBackendMutationResult
  return {
    mutate: trigger as (args: TBody) => Promise<TRes>,
    isLoading,
    error: error as Error | null,
  };
}
