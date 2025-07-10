// src/authentication/client/hooks/useBackend.ts

import useSWR from 'swr';
import { UseBackendOptions, UseBackendResult } from '@authentication/shared/types/Backend';

export const fetcher = (path: string, init?: Parameters<typeof fetch>[1]) =>
  fetch(path, {
    ...init,
    credentials: 'include',
  }).then(async res => {
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  });

export function useBackend<T>(options: UseBackendOptions): UseBackendResult<T> {
  const {
    path,
    refreshInterval,
    enabled = true,
  } = options;

  const swr = useSWR<T>(enabled ? path : null, () => fetcher(path), {
    refreshInterval,
  });

  return {
    data: swr.data ?? null,
    isLoading: !swr.error && !swr.data,
    error: swr.error ?? null,
    mutate: swr.mutate,
  };
}
