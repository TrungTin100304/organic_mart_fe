import type {
  DietType,
  MealPlanResponse,
  MealProductResponse,
  MealType,
  ShoppingListItem,
} from "../types/mealPlan";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Bữa sáng",
  LUNCH: "Bữa trưa",
  DINNER: "Bữa tối",
  SNACK: "Bữa phụ",
};

const DIET_LABELS: Record<DietType, string> = {
  NORMAL: "Bình thường",
  VEGETARIAN: "Chay",
  VEGAN: "Thuần chay",
  KETO: "Keto",
  PALEO: "Paleo",
  GLUTEN_FREE: "Không gluten",
};

const formatMoney = (value?: number) =>
  value != null ? `${value.toLocaleString("vi-VN")} VNĐ` : "Chưa xác định";

const quantityLabel = (quantity?: number, unit?: string) =>
  [quantity, unit].filter((value) => value != null && value !== "").join(" ") || "Theo nhu cầu";

function ProductRows({ products }: { products: MealProductResponse[] }) {
  return (
    <table className="meal-plan-print-table">
      <thead>
        <tr>
          <th>Sản phẩm / nguyên liệu</th>
          <th>Số lượng</th>
          <th>Giá dự kiến</th>
          <th>Tình trạng</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) => (
          <tr key={`${product.id}-${index}`}>
            <td>
              <strong>{product.productName || product.originalIngredientName}</strong>
              {product.productName && product.originalIngredientName !== product.productName && (
                <span className="meal-plan-print-muted">Cho: {product.originalIngredientName}</span>
              )}
            </td>
            <td>{quantityLabel(product.quantity, product.unit)}</td>
            <td>{formatMoney(product.estimatedPrice ?? product.productPrice)}</td>
            <td>{product.isInStock ? "Có sẵn" : "Chưa có hàng"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MealPlanPrintReport({
  plan,
  shoppingList,
}: {
  plan: MealPlanResponse;
  shoppingList: ShoppingListItem[];
}) {
  const totalShoppingCost = shoppingList.reduce(
    (sum, item) => sum + (item.totalEstimatedPrice ?? 0),
    0,
  );

  return (
    <article className="meal-plan-print-report" data-meal-plan-print-report="true">
      <header className="meal-plan-print-cover">
        <p className="meal-plan-print-eyebrow">RAU NHA MINH · Thực đơn cá nhân</p>
        <h1>{plan.name}</h1>
        <p>
          {plan.numberOfDays} ngày · {plan.mealsPerDay} bữa/ngày · {plan.servings} khẩu phần ·{" "}
          {DIET_LABELS[plan.dietType]}
        </p>
        <div className="meal-plan-print-meta-grid">
          <div><span>Bắt đầu</span><strong>{plan.startDate || "Chưa xác định"}</strong></div>
          <div><span>Mục tiêu calo</span><strong>{plan.dailyCalorieTarget ? `${plan.dailyCalorieTarget} kcal/ngày` : "Không đặt"}</strong></div>
          <div><span>Ngân sách tối đa</span><strong>{formatMoney(plan.budgetMax)}</strong></div>
          <div><span>Thời gian nấu tối đa</span><strong>{plan.maxCookingMinutes ? `${plan.maxCookingMinutes} phút` : "Không đặt"}</strong></div>
        </div>
        {plan.additionalNotes && (
          <div className="meal-plan-print-note">
            <strong>Ghi chú:</strong> {plan.additionalNotes}
          </div>
        )}
      </header>

      <section className="meal-plan-print-section">
        <h2>Tổng quan dinh dưỡng mỗi ngày</h2>
        <div className="meal-plan-print-macros">
          <div><strong>{plan.totalCaloriesPerDay ?? 0}</strong><span>kcal</span></div>
          <div><strong>{plan.totalProteinPerDay ?? 0}g</strong><span>Protein</span></div>
          <div><strong>{plan.totalCarbsPerDay ?? 0}g</strong><span>Carbs</span></div>
          <div><strong>{plan.totalFatPerDay ?? 0}g</strong><span>Chất béo</span></div>
        </div>
      </section>

      <section className="meal-plan-print-section meal-plan-print-page-break">
        <div className="meal-plan-print-heading-row">
          <div>
            <p className="meal-plan-print-eyebrow">Chuẩn bị trước khi nấu</p>
            <h2>Danh sách cần mua</h2>
          </div>
          <strong>Tổng dự kiến: {formatMoney(totalShoppingCost)}</strong>
        </div>
        {shoppingList.length > 0 ? (
          <table className="meal-plan-print-table">
            <thead>
              <tr>
                <th>Nguyên liệu</th>
                <th>Tổng số lượng</th>
                <th>Sản phẩm gợi ý</th>
                <th>Giá dự kiến</th>
                <th>Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {shoppingList.map((item) => (
                <tr key={item.key}>
                  <td><strong>{item.originalIngredientName}</strong></td>
                  <td>{quantityLabel(item.totalQuantity, item.unit)}</td>
                  <td>{item.products.map((product) => product.productName).filter(Boolean).join(", ") || "Chưa ghép sản phẩm"}</td>
                  <td>{formatMoney(item.totalEstimatedPrice)}</td>
                  <td>{item.isAnyInStock ? "Có sẵn" : "Cần mua ngoài"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="meal-plan-print-muted">Chưa có danh sách sản phẩm cần mua.</p>
        )}
      </section>

      {plan.days.map((day) => (
        <section key={day.dayNumber} className="meal-plan-print-day meal-plan-print-page-break">
          <div className="meal-plan-print-day-heading">
            <div>
              <p className="meal-plan-print-eyebrow">Kế hoạch chi tiết</p>
              <h2>Ngày {day.dayNumber}</h2>
            </div>
            <p>
              {day.totalCalories} kcal · {day.totalProtein}g protein · {day.totalCarbs}g carbs · {day.totalFat}g chất béo
            </p>
          </div>

          {day.meals.map((meal) => (
            <article key={meal.id} className="meal-plan-print-meal">
              <div className="meal-plan-print-meal-heading">
                <div>
                  <span>{MEAL_TYPE_LABELS[meal.mealType]}</span>
                  <h3>{meal.name}</h3>
                  {meal.description && <p>{meal.description}</p>}
                </div>
                <div className="meal-plan-print-meal-stats">
                  <strong>{meal.calories} kcal</strong>
                  <span>{meal.proteinGrams ?? 0}g P · {meal.carbsGrams ?? 0}g C · {meal.fatGrams ?? 0}g F</span>
                  {(meal.preparationMinutes || meal.cookingMinutes) && (
                    <span>
                      Chuẩn bị {meal.preparationMinutes ?? 0} phút · Nấu {meal.cookingMinutes ?? 0} phút
                    </span>
                  )}
                </div>
              </div>

              <div className="meal-plan-print-recipe-grid">
                <div>
                  <h4>Nguyên liệu</h4>
                  {meal.ingredients.length > 0 ? (
                    <ul>{meal.ingredients.map((ingredient, index) => <li key={index}>{ingredient}</li>)}</ul>
                  ) : (
                    <p className="meal-plan-print-muted">Chưa có thông tin nguyên liệu.</p>
                  )}
                </div>
                <div>
                  <h4>Cách nấu</h4>
                  <p className="meal-plan-print-instructions">
                    {meal.cookingInstructions || "Chưa có hướng dẫn nấu."}
                  </p>
                </div>
              </div>

              {meal.products.length > 0 && (
                <div className="meal-plan-print-products">
                  <h4>Sản phẩm gợi ý cho món này</h4>
                  <ProductRows products={meal.products} />
                </div>
              )}
            </article>
          ))}
        </section>
      ))}

      <footer className="meal-plan-print-footer">
        Thông tin dinh dưỡng và công thức do AI tạo, chỉ mang tính tham khảo. Kiểm tra dị ứng và nhu cầu dinh dưỡng cá nhân trước khi sử dụng.
      </footer>
    </article>
  );
}
