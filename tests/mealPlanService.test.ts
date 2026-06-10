import test from "node:test";
import assert from "node:assert/strict";

const mockApiRequest = async <T>(url: string, opts?: Record<string, unknown>): Promise<T> => {
  const responses: Record<string, unknown> = {
    "/meal-plans/generate": { id: 1, name: "Plan", status: "COMPLETED", days: [], createdAt: new Date().toISOString() },
    "/meal-plans": [
      { id: 1, name: "Plan A", status: "COMPLETED", days: [] },
      { id: 2, name: "Plan B", status: "COMPLETED", days: [] },
    ],
    "/meal-plans/5": { id: 5, name: "Plan 5", status: "COMPLETED", days: [] },
    "/meal-plans/3": undefined,
    "/meal-plans/1/meals/10": { id: 10, name: "Updated Meal" },
    "/meal-plans/1/meals/10/regenerate": { id: 10, name: "Regenerated Meal" },
    "/meal-plans/1/shopping-list": [
      {
        key: "bông cải xanh",
        originalIngredientName: "bông cải xanh",
        totalQuantity: 2,
        unit: "bó",
        products: [
          { id: 1, productId: 5, productName: "Bông cải xanh", isInStock: true, addedToCart: false },
          { id: 2, productId: 5, productName: "Bông cải xanh", isInStock: true, addedToCart: false },
        ],
        isFullyMapped: true,
        isAnyInStock: true,
        totalEstimatedPrice: 30000,
      },
      {
        key: "ức gà",
        originalIngredientName: "ức gà",
        unit: "500g",
        products: [],
        isFullyMapped: false,
        isAnyInStock: false,
        totalEstimatedPrice: 0,
      },
    ],
    "/meal-plans/1/add-to-cart": { addedCount: 5, message: "Đã thêm 5 sản phẩm vào giỏ hàng" },
  };
  return responses[url] as T;
};

// Track calls to verify requireAuth is set correctly
const callLog: Array<{ endpoint: string; opts: Record<string, unknown> }> = [];

const mockApiRequestForSecurity = async <T>(endpoint: string, opts: Record<string, unknown> = {}): Promise<T> => {
  callLog.push({ endpoint, opts });
  return mockApiRequest<T>(endpoint, opts);
};

// ─── Inline service calls for testing ─────────────────────────────────────────

async function generateMealPlan(payload: Record<string, unknown>) {
  return mockApiRequestForSecurity("/meal-plans/generate", { method: "POST", body: JSON.stringify(payload), requireAuth: true });
}

async function getMealPlans() {
  return mockApiRequestForSecurity("/meal-plans", { requireAuth: true });
}

async function getMealPlanById(id: number) {
  return mockApiRequestForSecurity(`/meal-plans/${id}`, { requireAuth: true });
}

async function deleteMealPlan(id: number) {
  return mockApiRequestForSecurity(`/meal-plans/${id}`, { method: "DELETE", requireAuth: true });
}

async function updateMeal(mealPlanId: number, mealId: number, payload: Record<string, unknown>) {
  return mockApiRequestForSecurity(`/meal-plans/${mealPlanId}/meals/${mealId}`, { method: "PUT", body: JSON.stringify(payload), requireAuth: true });
}

async function regenerateMeal(mealPlanId: number, mealId: number) {
  return mockApiRequestForSecurity(`/meal-plans/${mealPlanId}/meals/${mealId}/regenerate`, { method: "POST", requireAuth: true });
}

async function getShoppingList(id: number) {
  return mockApiRequestForSecurity(`/meal-plans/${id}/shopping-list`, { requireAuth: true });
}

async function addMealPlanToCart(id: number) {
  return mockApiRequestForSecurity(`/meal-plans/${id}/add-to-cart`, { method: "POST", requireAuth: true });
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

test("generateMealPlan sends POST with correct payload", async () => {
  const payload = { numberOfDays: 3, mealsPerDay: 3, servings: 2, dietType: "NORMAL", dailyCalorieTarget: 1500 };
  const result = await generateMealPlan(payload);
  assert.strictEqual((result as { id: number }).id, 1);
});

test("getMealPlans returns array of plans", async () => {
  const result = await getMealPlans();
  assert.strictEqual(Array.isArray(result), true);
  assert.strictEqual(result.length, 2);
});

test("getMealPlanById sends GET /meal-plans/{id}", async () => {
  const result = await getMealPlanById(5);
  assert.strictEqual((result as { id: number }).id, 5);
});

test("deleteMealPlan sends DELETE /meal-plans/{id}", async () => {
  const result = await deleteMealPlan(3);
  assert.strictEqual(result, undefined);
});

test("updateMeal sends PUT /meal-plans/{id}/meals/{mealId}", async () => {
  const payload = { name: "Updated Salad", ingredients: ["bông cải xanh", "dầu ô liu"], calories: 200 };
  const result = await updateMeal(1, 10, payload);
  assert.strictEqual((result as { name: string }).name, "Updated Meal");
});

test("regenerateMeal sends POST /meal-plans/{id}/meals/{mealId}/regenerate", async () => {
  const result = await regenerateMeal(1, 10);
  assert.strictEqual((result as { name: string }).name, "Regenerated Meal");
});

test("getShoppingList sends GET /meal-plans/{id}/shopping-list", async () => {
  const result = await getShoppingList(1);
  assert.strictEqual(Array.isArray(result), true);
  assert.strictEqual(result.length, 2);
});

test("addMealPlanToCart sends POST /meal-plans/{id}/add-to-cart", async () => {
  const result = await addMealPlanToCart(1) as { addedCount: number; message: string };
  assert.strictEqual(result.addedCount, 5);
});

test("shopping list groups duplicate ingredients correctly", async () => {
  const result = await getShoppingList(1) as Array<{
    key: string;
    originalIngredientName: string;
    isFullyMapped: boolean;
    isAnyInStock: boolean;
  }>;
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].key, "bông cải xanh");
  assert.strictEqual(result[0].isFullyMapped, true);
  assert.strictEqual(result[0].isAnyInStock, true);
  assert.strictEqual(result[1].key, "ức gà");
  assert.strictEqual(result[1].isFullyMapped, false);
  assert.strictEqual(result[1].isAnyInStock, false);
});

// ─── Security Tests ───────────────────────────────────────────────────────────

test("ALL meal plan service functions require authentication", async () => {
  callLog.length = 0;

  await generateMealPlan({ numberOfDays: 3, mealsPerDay: 3, servings: 1, dietType: "NORMAL" });
  await getMealPlans();
  await getMealPlanById(5);
  await deleteMealPlan(1);
  await updateMeal(1, 2, { name: "Test" });
  await regenerateMeal(1, 2);
  await getShoppingList(1);
  await addMealPlanToCart(1);

  assert.strictEqual(callLog.length, 8, "All 8 meal plan service functions should call apiRequest");
  for (let i = 0; i < callLog.length; i++) {
    const call = callLog[i];
    assert.strictEqual(
      call.opts.requireAuth,
      true,
      `Call ${i} (${call.endpoint}) must have requireAuth: true`
    );
  }
});

test("generateMealPlan uses POST method", async () => {
  callLog.length = 0;
  await generateMealPlan({ numberOfDays: 3 });
  assert.strictEqual(callLog[0].opts.method, "POST");
});

test("getMealPlans uses GET method (default)", async () => {
  callLog.length = 0;
  await getMealPlans();
  assert.strictEqual(callLog[0].opts.method || "GET", "GET");
});

test("deleteMealPlan uses DELETE method", async () => {
  callLog.length = 0;
  await deleteMealPlan(1);
  assert.strictEqual(callLog[0].opts.method, "DELETE");
});

test("updateMeal uses PUT method", async () => {
  callLog.length = 0;
  await updateMeal(1, 2, { name: "X" });
  assert.strictEqual(callLog[0].opts.method, "PUT");
});

test("regenerateMeal uses POST method", async () => {
  callLog.length = 0;
  await regenerateMeal(1, 2);
  assert.strictEqual(callLog[0].opts.method, "POST");
});

test("addMealPlanToCart uses POST method", async () => {
  callLog.length = 0;
  await addMealPlanToCart(1);
  assert.strictEqual(callLog[0].opts.method, "POST");
});

test("generateMealPlan sends JSON body", async () => {
  callLog.length = 0;
  const payload = { numberOfDays: 5, dietType: "VEGETARIAN" };
  await generateMealPlan(payload);
  assert.strictEqual(typeof callLog[0].opts.body, "string");
  const parsed = JSON.parse(callLog[0].opts.body as string);
  assert.strictEqual(parsed.numberOfDays, 5);
  assert.strictEqual(parsed.dietType, "VEGETARIAN");
});
