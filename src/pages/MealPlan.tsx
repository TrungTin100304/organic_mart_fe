import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Loader2, ShoppingCart, Printer, Calendar, Star, Utensils,
  ClipboardList, Settings, User, Zap, X, ChevronRight, RefreshCw,
  Check, AlertTriangle, Info, Trash2, Plus, UtensilsCrossed, Minus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  generateMealPlan,
  getMealPlans,
  getMealPlanById,
  deleteMealPlan,
  regenerateMeal,
  getShoppingList,
  addMealPlanToCart,
} from "../services/mealPlanService";
import type {
  MealPlanGenerationRequest,
  MealPlanResponse,
  MealDayResponse,
  MealResponse,
  ShoppingListItem,
  DietType,
  MealType,
} from "../types/mealPlan";
import { useUser } from "../hooks/useUser";
import MealPlanPrintReport from "../components/MealPlanPrintReport";

type PageState = "LOADING" | "FORM_READY" | "GENERATING" | "PLAN_READY" | "ERROR";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Sáng",
  LUNCH: "Trưa",
  DINNER: "Tối",
  SNACK: "Snack",
};

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "NORMAL", label: "Bình thường" },
  { value: "VEGETARIAN", label: "Chay" },
  { value: "VEGAN", label: "Thuần chay" },
  { value: "KETO", label: "Keto" },
  { value: "PALEO", label: "Paleo" },
  { value: "GLUTEN_FREE", label: "Không gluten" },
];

export default function MealPlan() {
  const { user } = useUser();

  // Page state
  const [pageState, setPageState] = useState<PageState>("LOADING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Debounce: prevent double-submit by tracking if a request is in flight
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved plans
  const [savedPlans, setSavedPlans] = useState<MealPlanResponse[]>([]);

  // Current active plan
  const [currentPlan, setCurrentPlan] = useState<MealPlanResponse | null>(null);

  // Selected day tab
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Selected meal for detail modal
  const [selectedMeal, setSelectedMeal] = useState<MealResponse | null>(null);

  // Regenerating meal loading
  const [regeneratingMealId, setRegeneratingMealId] = useState<number | null>(null);

  // Shopping list
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loadingShoppingList, setLoadingShoppingList] = useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    numberOfDays: 3,
    mealsPerDay: 3,
    servings: 1,
    dietType: "NORMAL" as DietType,
    dailyCalorieTarget: "",
    budgetMax: "",
    maxCookingMinutes: "",
    preferredIngredients: "",
    excludedIngredients: "",
    additionalNotes: "",
  });

  // Load user preference defaults and saved plans
  useEffect(() => {
    const init = async () => {
      if (user?.allergens && user.allergens.length > 0) {
        const excluded = user.allergens.map((a) => a.name).join(", ");
        setForm((f) => ({ ...f, excludedIngredients: excluded }));
      }
      try {
        const plans = await getMealPlans();
        setSavedPlans(plans);
      } catch {
        // ignore
      }
      setPageState("FORM_READY");
    };
    void init();
  }, [user]);

  // Auto-fill calorie target from user preference (only once when form is ready and user has data)
  useEffect(() => {
    if (pageState !== "FORM_READY" || !user) return;
    if (user.dailyCalorieTarget && !form.dailyCalorieTarget) {
      setForm((f) => ({ ...f, dailyCalorieTarget: String(user.dailyCalorieTarget) }));
    }
    if (user.dietType && !form.dietType) {
      setForm((f) => ({ ...f, dietType: user.dietType as DietType }));
    }
  }, [pageState, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleGenerate = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setPageState("GENERATING");
    setErrorMessage(null);
    try {
      const payload: MealPlanGenerationRequest = {
        numberOfDays: form.numberOfDays,
        mealsPerDay: form.mealsPerDay,
        servings: form.servings,
        dietType: form.dietType,
        dailyCalorieTarget: form.dailyCalorieTarget ? Number(form.dailyCalorieTarget) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        maxCookingMinutes: form.maxCookingMinutes ? Number(form.maxCookingMinutes) : undefined,
        preferredIngredients: form.preferredIngredients
          ? form.preferredIngredients.split("\n").map((s) => s.trim()).filter(Boolean)
          : undefined,
        excludedIngredients: form.excludedIngredients
          ? form.excludedIngredients.split("\n").map((s) => s.trim()).filter(Boolean)
          : undefined,
        additionalNotes: form.additionalNotes || undefined,
      };
      const plan = await generateMealPlan(payload);
      setCurrentPlan(plan);
      setSavedPlans((prev) => [plan, ...prev]);
      setSelectedDayIdx(0);
      setPageState("PLAN_READY");
    } catch (err: any) {
      const msg = err?.message || "Đã xảy ra lỗi khi tạo thực đơn.";
      if (msg.includes("đăng nhập") || msg.includes("401") || msg.includes("Unauthorized")) {
        setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setErrorMessage(msg);
      }
      setPageState("ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, isSubmitting]);

  const handleOpenPlan = useCallback(async (id: number) => {
    try {
      const plan = await getMealPlanById(id);
      setCurrentPlan(plan);
      setSelectedDayIdx(0);
      setPageState("PLAN_READY");
    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể mở thực đơn.");
      setPageState("ERROR");
    }
  }, []);

  const handleDeletePlan = useCallback(async (id: number) => {
    try {
      await deleteMealPlan(id);
      setSavedPlans((prev) => prev.filter((p) => p.id !== id));
      if (currentPlan?.id === id) {
        setCurrentPlan(null);
        setPageState("FORM_READY");
      }
      setDeleteConfirmId(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể xóa thực đơn.");
    }
  }, [currentPlan]);

  const handleRegenerateMeal = useCallback(async (mealId: number) => {
    if (!currentPlan) return;
    setRegeneratingMealId(mealId);
    try {
      const updatedMeal = await regenerateMeal(currentPlan.id, mealId);
      setCurrentPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map((day) => ({
            ...day,
            meals: day.meals.map((m) => (m.id === mealId ? updatedMeal : m)),
          })),
        };
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể tạo lại món ăn.");
    } finally {
      setRegeneratingMealId(null);
    }
  }, [currentPlan]);

  const handleShowShoppingList = useCallback(async () => {
    if (!currentPlan) return;
    setShowShoppingList(true);
    setLoadingShoppingList(true);
    try {
      const list = await getShoppingList(currentPlan.id);
      setShoppingList(list);
    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể tải danh sách mua hàng.");
    } finally {
      setLoadingShoppingList(false);
    }
  }, [currentPlan]);

  const handleAddToCart = useCallback(async () => {
    if (!currentPlan) return;
    try {
      const result = await addMealPlanToCart(currentPlan.id);
      setCartMessage(result.message);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setTimeout(() => setCartMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể thêm vào giỏ hàng.");
    }
  }, [currentPlan]);

  const handlePrintPlan = useCallback(async () => {
    if (!currentPlan || isPreparingPrint) return;
    setIsPreparingPrint(true);
    setErrorMessage(null);
    try {
      const list = await getShoppingList(currentPlan.id);
      setShoppingList(list);
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
      });
      await document.fonts?.ready;
      window.print();
    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể chuẩn bị bản PDF.");
    } finally {
      setIsPreparingPrint(false);
    }
  }, [currentPlan, isPreparingPrint]);

  const currentDay: MealDayResponse | undefined = currentPlan?.days[selectedDayIdx];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20 mb-4">
          <Sparkles size={14} />
          Thực đơn thông minh
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
          Lên kế hoạch thực đơn cá nhân
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl mx-auto">
          Khai báo sở thích, AI sẽ tạo thực đơn cân bằng dinh dưỡng cho bạn
        </p>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
          >
            <AlertTriangle size={18} />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="hover:bg-red-100 rounded p-1" aria-label="Dismiss">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Saved Plans Sidebar */}
        {savedPlans.length > 0 && pageState === "FORM_READY" && (
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-outline-variant p-4 shadow-sm">
              <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Thực đơn đã lưu
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container transition-colors group">
                    <button
                      onClick={() => handleOpenPlan(plan.id)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-bold text-on-surface truncate">{plan.name}</p>
                      <p className="text-xs text-on-surface-variant">{plan.numberOfDays} ngày · {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString("vi-VN") : ""}</p>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(plan.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                      aria-label="Xóa thực đơn"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* GENERATING / LOADING */}
            {(pageState === "LOADING" || pageState === "GENERATING") && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="relative size-16 rounded-full bg-primary flex items-center justify-center">
                    <Loader2 size={28} className="text-white animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-on-surface">AI đang thiết kế thực đơn...</p>
                  <p className="text-sm text-on-surface-variant mt-1">Có thể mất 10-30 giây</p>
                </div>
              </motion.div>
            )}

            {/* FORM */}
            {pageState === "FORM_READY" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-outline-variant p-6 md:p-8 shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Number of Days */}
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Số ngày</label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <button
                          key={n}
                          onClick={() => setForm((f) => ({ ...f, numberOfDays: n }))}
                          className={`size-10 rounded-xl font-bold text-sm transition-all ${
                            form.numberOfDays === n
                              ? "bg-primary text-white shadow-md"
                              : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meals per Day */}
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Bữa ăn/ngày</label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          onClick={() => setForm((f) => ({ ...f, mealsPerDay: n }))}
                          className={`size-10 rounded-xl font-bold text-sm transition-all ${
                            form.mealsPerDay === n
                              ? "bg-primary text-white shadow-md"
                              : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Servings */}
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Khẩu phần</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setForm((f) => ({ ...f, servings: Math.max(1, f.servings - 1) }))}
                        className="size-9 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
                        aria-label="Giảm"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-bold text-on-surface w-8 text-center">{form.servings}</span>
                      <button
                        onClick={() => setForm((f) => ({ ...f, servings: Math.min(10, f.servings + 1) }))}
                        className="size-9 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
                        aria-label="Tăng"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Diet Type */}
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Chế độ ăn</label>
                    <select
                      value={form.dietType}
                      onChange={(e) => setForm((f) => ({ ...f, dietType: e.target.value as DietType }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant bg-surface-container focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-on-surface font-medium"
                    >
                      {DIET_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Calorie Target */}
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Mục tiêu calo/ngày <span className="font-normal opacity-50">(tùy chọn)</span></label>
                    <input
                      type="number"
                      placeholder="VD: 1500"
                      value={form.dailyCalorieTarget}
                      onChange={(e) => setForm((f) => ({ ...f, dailyCalorieTarget: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant bg-surface-container focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-on-surface placeholder:text-on-surface-variant/50"
                      min={500} max={5000}
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Ngân sách tối đa (VNĐ) <span className="font-normal opacity-50">(tùy chọn)</span></label>
                    <input
                      type="number"
                      placeholder="VD: 200000"
                      value={form.budgetMax}
                      onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant bg-surface-container focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-on-surface placeholder:text-on-surface-variant/50"
                    />
                  </div>

                  {/* Cooking Minutes */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Thời gian nấu tối đa (phút) <span className="font-normal opacity-50">(tùy chọn)</span></label>
                    <input
                      type="number"
                      placeholder="VD: 60"
                      value={form.maxCookingMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, maxCookingMinutes: e.target.value }))}
                      className="w-full max-w-xs px-4 py-2.5 rounded-xl border-2 border-outline-variant bg-surface-container focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-on-surface placeholder:text-on-surface-variant/50"
                      min={5} max={240}
                    />
                  </div>
                </div>

                {/* Ingredients Textareas */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Nguyên liệu yêu thích <span className="font-normal opacity-50">(mỗi dòng 1 nguyên liệu)</span></label>
                    <textarea
                      value={form.preferredIngredients}
                      onChange={(e) => setForm((f) => ({ ...f, preferredIngredients: e.target.value }))}
                      placeholder="VD: bông cải xanh&#10;ức gà&#10;gạo lứt"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-on-surface placeholder:text-on-surface-variant/40 resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Nguyên liệu muốn tránh <span className="font-normal opacity-50">(mỗi dòng 1 nguyên liệu)</span></label>
                    <textarea
                      value={form.excludedIngredients}
                      onChange={(e) => setForm((f) => ({ ...f, excludedIngredients: e.target.value }))}
                      placeholder="VD: tôm&#10;thịt bò"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-on-surface placeholder:text-on-surface-variant/40 resize-none text-sm"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">Ghi chú thêm</label>
                  <textarea
                    value={form.additionalNotes}
                    onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                    placeholder="VD: Ăn nhẹ, không quá mặn..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-on-surface placeholder:text-on-surface-variant/40 resize-none text-sm"
                  />
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-on-surface-variant bg-primary/5 px-4 py-3 rounded-xl border border-primary/10">
                  <Info size={14} className="text-primary shrink-0" />
                  Thông tin dinh dưỡng do AI tạo chỉ mang tính tham khảo.
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isSubmitting}
                  className="mt-6 w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
                  {isSubmitting ? "Đang tạo thực đơn..." : "Tạo thực đơn"}
                  {!isSubmitting && <ChevronRight size={20} />}
                </button>
              </motion.div>
            )}

            {/* PLAN VIEW */}
            {pageState === "PLAN_READY" && currentPlan && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Plan Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface">{currentPlan.name}</h2>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {currentPlan.numberOfDays} ngày · {currentPlan.mealsPerDay} bữa/ngày · {currentPlan.servings} khẩu phần
                      {currentPlan.dailyCalorieTarget && ` · ${currentPlan.dailyCalorieTarget} kcal/ngày`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handlePrintPlan}
                      disabled={isPreparingPrint}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container transition-colors disabled:opacity-60 disabled:cursor-wait"
                    >
                      {isPreparingPrint ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                      {isPreparingPrint ? "Đang chuẩn bị..." : "Xuất PDF"}
                    </button>
                    <button
                      onClick={handleShowShoppingList}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container transition-colors"
                    >
                      <ClipboardList size={16} /> Danh sách mua
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 transition-colors shadow-md"
                    >
                      <ShoppingCart size={16} /> Thêm vào giỏ
                    </button>
                    <button
                      onClick={() => { setCurrentPlan(null); setPageState("FORM_READY"); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-colors"
                    >
                      <Plus size={16} /> Tạo mới
                    </button>
                  </div>
                </div>

                {cartMessage && (
                  <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm font-bold">
                    <Check size={16} /> {cartMessage}
                  </div>
                )}

                {/* Day Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
                  {currentPlan.days.map((day, idx) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setSelectedDayIdx(idx)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        selectedDayIdx === idx
                          ? "bg-primary text-white shadow-md"
                          : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                      }`}
                    >
                      Ngày {day.dayNumber}
                    </button>
                  ))}
                </div>

                {/* Day Summary */}
                {currentDay && (
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MacroCard label="Calo" value={currentDay.totalCalories} unit="kcal" color="text-primary" />
                    <MacroCard label="Protein" value={currentDay.totalProtein} unit="g" color="text-blue-600" />
                    <MacroCard label="Carbs" value={currentDay.totalCarbs} unit="g" color="text-amber-600" />
                    <MacroCard label="Chất béo" value={currentDay.totalFat} unit="g" color="text-red-500" />
                  </div>
                )}

                {/* Meals Grid */}
                {currentDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentDay.meals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onSelect={() => setSelectedMeal(meal)}
                        onRegenerate={() => handleRegenerateMeal(meal.id)}
                        isRegenerating={regeneratingMealId === meal.id}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Meal Detail Modal */}
      <AnimatePresence>
        {selectedMeal && (
          <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} onRegenerate={() => {
            handleRegenerateMeal(selectedMeal.id);
            setSelectedMeal(null);
          }} isRegenerating={regeneratingMealId === selectedMeal.id} />
        )}
      </AnimatePresence>

      {/* Shopping List Modal */}
      <AnimatePresence>
        {showShoppingList && (
          <ShoppingListModal
            items={shoppingList}
            loading={loadingShoppingList}
            onClose={() => setShowShoppingList(false)}
            onAddToCart={handleAddToCart}
            onPrint={handlePrintPlan}
            cartMessage={cartMessage}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <DeleteConfirmModal
            onConfirm={() => handleDeletePlan(deleteConfirmId)}
            onCancel={() => setDeleteConfirmId(null)}
          />
        )}
      </AnimatePresence>

      {currentPlan && <MealPlanPrintReport plan={currentPlan} shoppingList={shoppingList} />}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MacroCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant p-3 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-on-surface-variant font-medium">{label} ({unit})</p>
    </div>
  );
}

function MealCard({
  meal,
  onSelect,
  onRegenerate,
  isRegenerating,
}: {
  meal: MealResponse;
  onSelect: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-outline-variant overflow-hidden hover:shadow-md transition-shadow group"
    >
      <button onClick={onSelect} className="w-full text-left p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
            {MEAL_TYPE_LABELS[meal.mealType]}
          </span>
          <div className={`flex items-center gap-1 text-xs font-bold ${meal.calories > 0 ? "text-primary" : "text-on-surface-variant"}`}>
            <Zap size={12} className={meal.calories > 0 ? "fill-primary" : ""} />
            {meal.calories} kcal
          </div>
        </div>
        <h4 className="font-bold text-on-surface text-sm leading-tight mb-1 line-clamp-2">{meal.name}</h4>
        {meal.description && (
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{meal.description}</p>
        )}
        {meal.products.length > 0 && (
          <p className="text-xs text-on-surface-variant mt-2">
            {meal.products.filter((p) => p.isInStock).length}/{meal.products.length} sản phẩm có sẵn
          </p>
        )}
      </button>
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {isRegenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Tạo lại
        </button>
      </div>
    </motion.div>
  );
}

function MealDetailModal({
  meal,
  onClose,
  onRegenerate,
  isRegenerating,
}: {
  meal: MealResponse;
  onClose: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-outline-variant p-4 flex items-center justify-between">
          <div>
            <span className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
              {MEAL_TYPE_LABELS[meal.mealType]}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-xl transition-colors" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-on-surface">{meal.name}</h3>
            {meal.description && <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{meal.description}</p>}
          </div>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <MacroCard label="Calo" value={meal.calories} unit="kcal" color="text-primary" />
            <MacroCard label="Protein" value={meal.proteinGrams || 0} unit="g" color="text-blue-600" />
            <MacroCard label="Carbs" value={meal.carbsGrams || 0} unit="g" color="text-amber-600" />
            <MacroCard label="Chất béo" value={meal.fatGrams || 0} unit="g" color="text-red-500" />
          </div>

          {/* Time */}
          {(meal.preparationMinutes || meal.cookingMinutes) && (
            <div className="flex gap-4 text-sm text-on-surface-variant">
              {meal.preparationMinutes && <span>Chuẩn bị: {meal.preparationMinutes} phút</span>}
              {meal.cookingMinutes && <span>Nấu: {meal.cookingMinutes} phút</span>}
            </div>
          )}

          {/* Ingredients */}
          {meal.ingredients.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-on-surface mb-2">Nguyên liệu</h4>
              <ul className="space-y-1.5">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cooking Instructions */}
          {meal.cookingInstructions && (
            <div>
              <h4 className="font-bold text-sm text-on-surface mb-2">Các bước nấu</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                {meal.cookingInstructions}
              </p>
            </div>
          )}

          {/* Product Suggestions */}
          {meal.products.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-on-surface mb-2">Sản phẩm gợi ý</h4>
              <div className="space-y-2">
                {meal.products.map((prod) => (
                  <div key={prod.id} className="flex items-center gap-3 p-2 rounded-xl bg-surface-container">
                    <div className="size-8 rounded-lg bg-white overflow-hidden flex-shrink-0">
                      {prod.productImageUrl ? (
                        <img src={prod.productImageUrl} alt={prod.productName || ""} className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-primary/10 flex items-center justify-center">
                          <UtensilsCrossed size={14} className="text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">
                        {prod.productName || prod.originalIngredientName}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {prod.quantity} {prod.unit}
                        {prod.productPrice && ` · ${prod.productPrice.toLocaleString("vi-VN")} VNĐ`}
                      </p>
                    </div>
                    {prod.isInStock ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                        <Check size={12} /> Còn hàng
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                        <AlertTriangle size={12} /> Hết hàng
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-on-surface-variant bg-primary/5 px-3 py-2.5 rounded-xl border border-primary/10">
            <Info size={12} className="text-primary shrink-0 mt-0.5" />
            Thông tin dinh dưỡng do AI tạo, chỉ mang tính tham khảo.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShoppingListModal({
  items,
  loading,
  onClose,
  onAddToCart,
  onPrint,
  cartMessage,
}: {
  items: ShoppingListItem[];
  loading: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  onPrint: () => void;
  cartMessage: string | null;
}) {
  const inStockItems = items.filter((item) => item.isAnyInStock);
  const outOfStockItems = items.filter((item) => !item.isAnyInStock);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-outline-variant flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
            <ClipboardList size={18} className="text-primary" /> Danh sách cần mua
            <span className="text-sm font-normal text-on-surface-variant">({items.length} mục)</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              disabled={loading}
              className="p-2 hover:bg-surface-container rounded-xl transition-colors"
              aria-label="Xuất PDF đầy đủ"
            >
              <Printer size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-xl transition-colors" aria-label="Đóng">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-on-surface-variant">Đang tải...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-on-surface-variant">Không có nguyên liệu nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inStockItems.length > 0 && (
                <>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Có sẵn ({inStockItems.length})</p>
                  {inStockItems.map((item) => (
                    <ShoppingItem key={item.key} item={item} />
                  ))}
                </>
              )}
              {outOfStockItems.length > 0 && (
                <>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wide mt-4">Chưa tìm thấy sản phẩm ({outOfStockItems.length})</p>
                  {outOfStockItems.map((item) => (
                    <ShoppingItem key={item.key} item={item} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-outline-variant shrink-0">
          {cartMessage && (
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-green-600">
              <Check size={14} /> {cartMessage}
            </div>
          )}
          <button
            onClick={onAddToCart}
            disabled={inStockItems.length === 0}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-colors shadow-md disabled:opacity-50 disabled:grayscale"
          >
            <ShoppingCart size={18} />
            Thêm {inStockItems.length > 0 ? `(${inStockItems.length} sản phẩm)` : "vào giỏ hàng"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShoppingItem({ item }: { item: ShoppingListItem }) {
  return (
    <div className="p-3 rounded-xl bg-surface-container">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-sm text-on-surface">{item.originalIngredientName}</p>
          <p className="text-xs text-on-surface-variant">
            {item.totalQuantity} {item.unit}
            {item.totalEstimatedPrice && item.totalEstimatedPrice > 0 && (
              <> · ~{item.totalEstimatedPrice.toLocaleString("vi-VN")} VNĐ</>
            )}
          </p>
        </div>
        {!item.isAnyInStock && (
          <span className="flex items-center gap-1 text-xs font-bold text-red-500">
            <AlertTriangle size={12} /> Chưa tìm thấy
          </span>
        )}
      </div>
      {item.products.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.products.map((prod) => (
            <span
              key={prod.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                prod.isInStock
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-500 border border-red-200"
              }`}
            >
              {prod.isInStock && <Check size={10} />}
              {prod.productName || prod.originalIngredientName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="size-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2">Xóa thực đơn?</h3>
        <p className="text-sm text-on-surface-variant mb-6">Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border-2 border-outline-variant text-on-surface font-bold hover:bg-surface-container transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
          >
            Xóa
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
