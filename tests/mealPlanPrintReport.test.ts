import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import MealPlanPrintReport from "../src/components/MealPlanPrintReport.tsx";
import type { MealPlanResponse, ShoppingListItem } from "../src/types/mealPlan.ts";

const plan: MealPlanResponse = {
  id: 12,
  name: "Full weekly plan",
  startDate: "2026-06-08",
  numberOfDays: 2,
  mealsPerDay: 1,
  servings: 2,
  dietType: "NORMAL",
  dailyCalorieTarget: 1800,
  budgetMax: 500000,
  maxCookingMinutes: 45,
  additionalNotes: "Low salt",
  status: "COMPLETED",
  totalCaloriesPerDay: 1800,
  totalProteinPerDay: 90,
  totalCarbsPerDay: 220,
  totalFatPerDay: 60,
  createdAt: "2026-06-08T10:00:00Z",
  days: [
    {
      dayNumber: 1,
      totalCalories: 500,
      totalProtein: 30,
      totalCarbs: 60,
      totalFat: 12,
      meals: [
        {
          id: 101,
          mealType: "BREAKFAST",
          name: "Oat bowl",
          description: "Quick breakfast",
          ingredients: ["Oats 100g", "Banana 1"],
          cookingInstructions: "Mix oats. Add banana.",
          preparationMinutes: 5,
          cookingMinutes: 10,
          calories: 500,
          proteinGrams: 30,
          carbsGrams: 60,
          fatGrams: 12,
          products: [
            {
              id: 1,
              productId: 7,
              productName: "Organic oats",
              productPrice: 45000,
              originalIngredientName: "Oats",
              quantity: 1,
              unit: "bag",
              estimatedPrice: 45000,
              isInStock: true,
              addedToCart: false,
            },
          ],
        },
      ],
    },
    {
      dayNumber: 2,
      totalCalories: 600,
      totalProtein: 35,
      totalCarbs: 70,
      totalFat: 15,
      meals: [
        {
          id: 102,
          mealType: "DINNER",
          name: "Vegetable soup",
          ingredients: ["Carrot 2"],
          cookingInstructions: "Simmer until tender.",
          calories: 600,
          products: [],
        },
      ],
    },
  ],
};

const shoppingList: ShoppingListItem[] = [
  {
    key: "oats",
    originalIngredientName: "Oats",
    totalQuantity: 1,
    unit: "bag",
    products: plan.days[0].meals[0].products,
    isFullyMapped: true,
    isAnyInStock: true,
    totalEstimatedPrice: 45000,
  },
];

test("print report contains every meal, recipe, product and shopping item", () => {
  const markup = renderToStaticMarkup(
    React.createElement(MealPlanPrintReport, { plan, shoppingList }),
  );

  assert.match(markup, /data-meal-plan-print-report="true"/);
  assert.match(markup, /Full weekly plan/);
  assert.match(markup, /Oat bowl/);
  assert.match(markup, /Mix oats\. Add banana\./);
  assert.match(markup, /Organic oats/);
  assert.match(markup, /Vegetable soup/);
  assert.match(markup, /Simmer until tender\./);
  assert.match(markup, /Oats 100g/);
  assert.match(markup, /Low salt/);
});

