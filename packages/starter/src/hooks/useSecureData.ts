import { axiosApp } from '@stateforge/core';
import { useEffect, useState } from 'react';

export function useSecureData() {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecure = async () => {
      try {
        const res = await axiosApp.get('/api/user/secure');
        setData(res.data?.secureData ?? 'No data');
      } catch (err: any) {
        setError(err?.response?.data?.error ?? 'Secure fetch failed');
      }
    };
    fetchSecure();
  }, []);

  return { data, error };
}
