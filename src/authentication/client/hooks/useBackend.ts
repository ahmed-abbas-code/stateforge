// src/authentication/client/hooks/useBackend.ts

import useSWR from 'swr';
import {
  UseBackendOptions,
  UseBackendResult,
} from '@authentication/shared/types/Backend';
import { useAuthContext } from '../components/AuthProvider';
import { getTenantId } from '../utils/auth';

export const useBackend = <T>(options: UseBackendOptions): UseBackendResult<T> => {
  const {
    path,
    refreshInterval,
    enabled = true,
    headers = {},
    auth = true, // ✅ new option
  } = options;

  const { handleResponse, getToken } = useAuthContext();

  const fetcher = async () => {
    const token = auth !== false ? await getToken?.() : null;
    const tenant = getTenantId();

    const res = await fetch(path, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(tenant && { 'X-Tenant-Id': tenant }),
      },
    });

    const handled = handleResponse ? await handleResponse(res) : res;

    if (handled.status === 204 || handled.status === 205) {
      if (!handled.ok) throw null;
      return null as unknown as T;
    }

    const json = await handled.json();
    if (!handled.ok) throw json;
    return json as T;
  };

  const swr = useSWR<T>(enabled ? path : null, fetcher, { refreshInterval });

  return {
    data: swr.data ?? null,
    isLoading: enabled && !swr.data && !swr.error,
    error: swr.error ?? null,
    mutate: swr.mutate,
  };
};
