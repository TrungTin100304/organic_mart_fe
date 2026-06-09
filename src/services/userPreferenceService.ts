import { apiRequest, toJsonBody } from "./apiClient";
import type { DietType } from "../types/mealPlan";

export interface UserPreference {
  id?: number;
  userId?: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  healthGoal?: string;
  dietType?: DietType;
  dailyCalorieTarget?: number;
  updatedAt?: string;
}

export interface UpdatePreferencePayload {
  heightCm: number;
  weightKg: number;
  healthGoal?: string;
  dietType?: DietType;
  dailyCalorieTarget?: number;
}

export const getUserPreference = () =>
  apiRequest<UserPreference>("/user-preferences/me", { requireAuth: true });

export const saveUserPreference = (data: UpdatePreferencePayload) =>
  apiRequest<UserPreference>("/user-preferences", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });
