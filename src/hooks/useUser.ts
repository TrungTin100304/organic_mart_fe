import { useEffect, useState } from 'react';
import type { User } from '@/types/user';
import { getCurrentUser } from '@/services/userService';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const u = await getCurrentUser();
        if (!mounted) return;
        setUser(u);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load user');
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return { user, isLoading, error, refetch: () => void getCurrentUser().then(setUser).catch((e) => setError(String(e))) };
};

