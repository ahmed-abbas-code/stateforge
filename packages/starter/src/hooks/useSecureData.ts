import { isAxiosError } from 'axios';
import { axiosApp } from 'packages/core/dist/client-only';
import { useEffect, useState } from 'react';

export function useSecureData() {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecure = async () => {
      try {
        const res = await axiosApp.get('/api/user/secure');
        setData(res.data?.secureData ?? 'No data');
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.error ?? 'Secure fetch failed');
        } else {
          setError('Secure fetch failed');
        }
      }
    };

    fetchSecure();
  }, []);

  return { data, error };
}
