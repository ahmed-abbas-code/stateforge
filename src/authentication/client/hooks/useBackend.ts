// src/authentication/client/hooks/useBackend.ts
import useSWR from 'swr';
import {
  UseBackendOptions,
  UseBackendResult,
} from '@authentication/shared/types/Backend';
import { useAuthContext } from '../components/AuthProvider';

export const useBackend = <T>(options: UseBackendOptions): UseBackendResult<T> => {
  const { path, refreshInterval, enabled = true, headers } = options;
  const { handleResponse } = useAuthContext();

  /* ---------------------------------- */
  /* fetcher                            */
  /* ---------------------------------- */
  const fetcher = async () => {
    const res = await fetch(path, { credentials: 'include', headers });

    // global 401 / sign-out handling
    const handled = handleResponse ? await handleResponse(res) : res;

    // 🆕  No-Content guard
    if (handled.status === 204 || handled.status === 205) {
      if (!handled.ok) throw null;         // 4xx/5xx edge-case with no body
      return null as unknown as T;         // return null data for 204/205
    }

    const json = await handled.json();
    if (!handled.ok) throw json;
    return json as T;
  };

  /* ---------------------------------- */
  /* swr hook                           */
  /* ---------------------------------- */
  const swr = useSWR<T>(enabled ? path : null, fetcher, { refreshInterval });

  return {
    data: swr.data ?? null,
    isLoading: enabled && !swr.data && !swr.error,
    error: swr.error ?? null,
    mutate: swr.mutate,
  };
};
