export type DietType = 'NORMAL' | 'VEGETARIAN' | 'VEGAN' | 'KETO' | 'PALEO' | 'GLUTEN_FREE';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type MealPlanStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface MealPlanGenerationRequest {
  numberOfDays: number;
  mealsPerDay: number;
  servings: number;
  dietType: DietType;
  dailyCalorieTarget?: number;
  budgetMax?: number;
  maxCookingMinutes?: number;
  preferredIngredients?: string[];
  excludedIngredients?: string[];
  additionalNotes?: string;
}

export interface MealPlanResponse {
  id: number;
  name: string;
  startDate: string | null;
  numberOfDays: number;
  mealsPerDay: number;
  servings: number;
  dietType: DietType;
  dailyCalorieTarget?: number;
  budgetMax?: number;
  maxCookingMinutes?: number;
  additionalNotes?: string;
  status: MealPlanStatus;
  days: MealDayResponse[];
  totalCaloriesPerDay?: number;
  totalProteinPerDay?: number;
  totalCarbsPerDay?: number;
  totalFatPerDay?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface MealDayResponse {
  dayNumber: number;
  meals: MealResponse[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealResponse {
  id: number;
  mealType: MealType;
  name: string;
  description?: string;
  ingredients: string[];
  cookingInstructions?: string;
  preparationMinutes?: number;
  cookingMinutes?: number;
  calories: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  products: MealProductResponse[];
}

export interface MealProductResponse {
  id: number;
  productId?: number;
  productName?: string;
  productPrice?: number;
  productImageUrl?: string;
  productUnit?: string;
  originalIngredientName: string;
  quantity?: number;
  unit: string;
  estimatedPrice?: number;
  isInStock: boolean;
  addedToCart: boolean;
}

export interface ShoppingListItem {
  key: string;
  originalIngredientName: string;
  totalQuantity?: number;
  unit: string;
  products: MealProductResponse[];
  isFullyMapped: boolean;
  isAnyInStock: boolean;
  totalEstimatedPrice?: number;
}

export interface UpdateMealRequest {
  name: string;
  description?: string;
  ingredients: string[];
  cookingInstructions?: string;
  preparationMinutes?: number;
  cookingMinutes?: number;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
}
