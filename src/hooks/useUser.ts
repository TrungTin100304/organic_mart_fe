import { useEffect, useState, useCallback } from 'react';
import type { User } from '@/types/user';
import { getCurrentUser } from '@/services/userService';
import { saveUserPreference, type UpdatePreferencePayload } from '@/services/userPreferenceService';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch (e: any) {
      setError(e?.message || 'Failed to load user');
    }
  }, []);

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

  const refetch = useCallback(() => void loadUser(), [loadUser]);

  const updatePreference = useCallback(async (data: UpdatePreferencePayload) => {
    const saved = await saveUserPreference(data);
    setUser((prev) => prev ? {
      ...prev,
      heightCm: saved.heightCm,
      weightKg: saved.weightKg,
      bmi: saved.bmi,
      healthGoal: saved.healthGoal,
      dietType: saved.dietType,
      dailyCalorieTarget: saved.dailyCalorieTarget,
    } : prev);
  }, []);

  return {
    user,
    isLoading,
    error,
    refetch,
    updatePreference,
  };
};

