import { axiosApp } from '@stateforge/core';
import { useState, useEffect, useCallback } from 'react';

type UserProfile = {
  name: string;
  theme: 'light' | 'dark';
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosApp.get('/api/user');
      setProfile(res.data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (newData: Partial<UserProfile>) => {
    try {
      const res = await axiosApp.post('/api/user', newData);
      if (res.status === 200) {
        await fetchProfile();
      }
    } catch (err: any) {
      setError(err?.message ?? 'Update failed');
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
