// src/authentication/client/hooks/useBackend.ts

import useSWR from 'swr';

export const fetcher = (path: string, init?: Parameters<typeof fetch>[1]) =>
  fetch(path, {
    ...init,
    credentials: 'include',
  }).then(async res => {
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  });

export function useBackend<T>(path: string, config?: { refreshInterval?: number }) {
  return useSWR<T>(path, () => fetcher(path), config);
}
