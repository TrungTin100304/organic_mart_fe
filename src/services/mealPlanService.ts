import { apiRequest, toJsonBody } from "./apiClient";
import type {
  MealPlanGenerationRequest,
  MealPlanResponse,
  MealResponse,
  ShoppingListItem,
  UpdateMealRequest,
} from "../types/mealPlan";
import type { Cart } from "../types/cart";

export const generateMealPlan = (data: MealPlanGenerationRequest) =>
  apiRequest<MealPlanResponse>("/meal-plans/generate", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const getMealPlans = () =>
  apiRequest<MealPlanResponse[]>("/meal-plans", { requireAuth: true });

export const getMealPlanById = (id: number) =>
  apiRequest<MealPlanResponse>(`/meal-plans/${id}`, { requireAuth: true });

export const deleteMealPlan = (id: number) =>
  apiRequest<void>(`/meal-plans/${id}`, { method: "DELETE", requireAuth: true });

export const updateMeal = (
  mealPlanId: number,
  mealId: number,
  data: UpdateMealRequest
) =>
  apiRequest<MealResponse>(`/meal-plans/${mealPlanId}/meals/${mealId}`, {
    method: "PUT",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const regenerateMeal = (mealPlanId: number, mealId: number) =>
  apiRequest<MealResponse>(
    `/meal-plans/${mealPlanId}/meals/${mealId}/regenerate`,
    { method: "POST", requireAuth: true }
  );

export const getShoppingList = (id: number) =>
  apiRequest<ShoppingListItem[]>(`/meal-plans/${id}/shopping-list`, {
    requireAuth: true,
  });

export interface AddToCartResult {
  addedCount: number;
  message: string;
}

export const addMealPlanToCart = (id: number) =>
  apiRequest<AddToCartResult>(`/meal-plans/${id}/add-to-cart`, {
    method: "POST",
    requireAuth: true,
  });
