import { useState } from "react";
import { Salad, Sparkles, Loader2, ChevronRight, Apple, Clock, ChefHat, ShoppingBasket } from "lucide-react";
import { generateMealPlan, DayPlan } from "../services/geminiService";
import { motion, AnimatePresence } from "motion/react";

export default function MealPlan() {
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<DayPlan[] | null>(null);

  const handleGenerate = async () => {
    if (!preferences.trim()) return;
    setLoading(true);
    try {
      const result = await generateMealPlan(preferences);
      setPlans(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
          <Sparkles size={14} />
          Sức khỏe từ AI
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">Lên kế hoạch thực đơn cá nhân</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
          Hãy cho chúng tôi biết mục tiêu ăn uống, dị ứng hoặc thành phần yêu thích của bạn, AI sẽ thiết kế một thực đơn hữu cơ cân bằng dành riêng cho bạn.
        </p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-outline-variant shadow-xl shadow-primary/5 mb-20 relative overflow-hidden ring-1 ring-primary/5">
        <div className="absolute top-0 right-0 p-8 text-primary/10 pointer-events-none">
          <Salad size={120} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-60 ml-1">
              Sở thích ăn uống & Mục tiêu
            </label>
            <textarea 
              className="w-full p-6 rounded-3xl border-2 border-outline-variant bg-surface-container-low focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-lg min-h-[160px] resize-none"
              placeholder="Ví dụ: Ăn chay, thực đơn keto, giàu protein, dị ứng các loại hạt, thích bơ và cải xoăn..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={loading || !preferences.trim()}
            className="w-full bg-primary text-on-primary h-20 rounded-3xl font-bold text-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Đang thiết kế kế hoạch...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Tạo kế hoạch sức khỏe của tôi
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {plans && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Kế hoạch 3 ngày của bạn</h2>
              <button className="text-primary font-bold flex items-center gap-2 hover:underline">
                Làm mới kế hoạch <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {plans.map((day, dayIndex) => (
                <motion.div 
                  key={dayIndex}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: dayIndex * 0.1 }}
                  className="bg-surface-container-lowest rounded-[3rem] border border-outline-variant p-8 md:p-12 shadow-sm"
                >
                  <h3 className="text-4xl font-bold text-primary mb-12 flex items-center gap-4">
                    <span className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-black italic">D{dayIndex + 1}</span>
                    {day.day}
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {[
                      { type: "Bữa sáng", data: day.breakfast, color: "bg-orange-50 text-orange-700", icon: Apple },
                      { type: "Bữa trưa", data: day.lunch, color: "bg-green-50 text-green-700", icon: Salad },
                      { type: "Bữa tối", data: day.dinner, color: "bg-blue-50 text-blue-700", icon: ChefHat }
                    ].map((meal, i) => (
                      <div key={i} className="flex flex-col h-full group">
                        <div className={`p-4 rounded-2xl ${meal.color} font-bold text-sm uppercase tracking-widest flex items-center gap-3 mb-6 w-fit`}>
                          <meal.icon size={18} />
                          {meal.type}
                        </div>
                        <h4 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{meal.data.name}</h4>
                        <div className="space-y-4 flex-grow">
                          <p className="text-sm font-medium text-on-surface-variant leading-relaxed italic opacity-80 mb-6">
                            "{meal.data.instructions}"
                          </p>
                          
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Thành phần chính</p>
                            <div className="flex flex-wrap gap-2">
                              {meal.data.ingredients.slice(0, 4).map((ing, j) => (
                                <span key={j} className="px-3 py-1 bg-white border border-outline-variant rounded-full text-xs font-semibold">{ing}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-dashed border-outline-variant">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Mua nguyên liệu cho bữa này</p>
                          <div className="space-y-2">
                            {meal.data.suggestedProducts.slice(0, 2).map((prod, k) => (
                              <button key={k} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all text-xs font-bold group/btn">
                                <span className="flex items-center gap-2">
                                  <ShoppingBasket size={14} className="text-primary" />
                                  {prod}
                                </span>
                                <Plus size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 bg-secondary p-10 md:p-14 rounded-[3rem] text-center text-on-secondary shadow-2xl relative overflow-hidden ring-1 ring-white/10">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
               <h3 className="text-3xl font-bold mb-6 relative">Sẵn sàng bắt đầu hành trình của bạn?</h3>
               <p className="text-lg opacity-80 mb-10 max-w-xl mx-auto font-medium relative leading-relaxed">
                 Thêm tất cả nguyên liệu hữu cơ gợi ý vào giỏ hàng chỉ với một cú nhấp chuột và nhận hàng ngay hôm nay.
               </p>
               <button className="bg-white text-secondary px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl relative inline-flex items-center gap-3">
                 Thêm tất cả vào giỏ hàng <ShoppingBasket size={24} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Plus({ size, className }: { size: number, className: string }) {
  return <Sparkles size={size} className={className} />;
}
