import { useState } from "react";
import { Salad, Sparkles, Loader2, Plus as PlusIcon, Check, ShoppingCart, Info, Printer, Calendar, Star, Utensils, ClipboardList, Settings, User, Zap } from "lucide-react";
import { generateMealPlan, DayPlan, Meal } from "../services/geminiService";
import { motion, AnimatePresence } from "motion/react";

export default function MealPlan() {
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<DayPlan[] | null>(null);

  // States cho UI Plan Board
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<{ dayIdx: number, type: 'breakfast'|'lunch'|'dinner', data: Meal } | null>(null);

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
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-10 flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 hidden md:flex flex-col gap-8 sticky top-24 h-[calc(100vh-120px)] border-r border-outline-variant pr-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-sm">Green Planner</h3>
            <p className="text-xs text-on-surface-variant">Sống Khỏe Mỗi Ngày</p>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          {plans ? (
            <button
              onClick={() => setPlans(null)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-colors font-medium text-sm"
            >
              <Sparkles size={18} /> Tạo thực đơn mới
            </button>
          ) : (
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md">
              <Sparkles size={18} /> Tạo thực đơn
            </button>
          )}

          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors
              ${plans ? 'bg-primary text-white shadow-md font-bold' : 'text-on-surface hover:bg-surface-container'}`}
          >
            <Calendar size={18} /> Thực đơn của tôi
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-colors font-medium text-sm">
            <Star size={18} /> Món ăn đặc biệt
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-colors font-medium text-sm">
            <Utensils size={18} /> Công thức
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-colors font-medium text-sm">
            <ClipboardList size={18} /> Danh sách cần mua
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-colors font-medium text-sm">
            <Settings size={18} /> Cài đặt
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-grow w-full max-w-5xl">
        {!plans && (
          <>
            <div className="text-center mb-10 md:mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                <Sparkles size={14} />
                Sức khỏe từ AI
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface px-2">Lên kế hoạch thực đơn cá nhân</h1>
              <p className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto font-medium px-4">
                Hãy cho chúng tôi biết mục tiêu ăn uống, dị ứng hoặc thành phần yêu thích của bạn, AI sẽ thiết kế một thực đơn hữu cơ cân bằng dành riêng cho bạn.
              </p>
            </div>

            <div className="bg-white p-6 md:p-12 rounded-2xl md:rounded-[2.5rem] border border-outline-variant shadow-xl shadow-primary/5 mb-10 md:mb-20 relative overflow-hidden ring-1 ring-primary/5">
              <div className="absolute top-0 right-0 p-4 md:p-8 text-primary/10 pointer-events-none hidden sm:block">
                <Salad size={120} strokeWidth={1} />
              </div>

              <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="space-y-4">
                  <label className="block text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-60 ml-1">
                    Sở thích ăn uống & Mục tiêu
                  </label>
                  <textarea
                    className="w-full p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-outline-variant bg-surface-container-low focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-base md:text-lg min-h-[140px] md:min-h-[160px] resize-none"
                    placeholder="Ví dụ: Ăn chay, thực đơn keto, giàu protein, dị ứng các loại hạt, thích bơ và cải xoăn..."
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !preferences.trim()}
                  className="w-full bg-primary text-on-primary h-16 md:h-20 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl flex items-center justify-center gap-2 md:gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
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
          </>
        )}

        <AnimatePresence mode="wait">
          {plans && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-6 md:gap-8"
            >
              {/* Left side: Calendar Board */}
              <div className="w-full flex-grow bg-white/50 backdrop-blur-md rounded-3xl md:rounded-[2.5rem] border border-outline-variant p-4 md:p-10 shadow-lg overflow-x-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                  <div>
                     <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">Lên kế hoạch ăn xanh</h2>
                     <p className="text-sm md:text-base text-on-surface-variant font-medium mt-1">Gợi ý từ AI theo sở thích của bạn</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                    <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors text-sm">
                      <Printer size={16} /> In kế hoạch
                    </button>
                    <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold hover:brightness-110 transition-colors shadow-md text-sm">
                      <ShoppingCart size={16} /> Thêm tất cả vào giỏ hàng
                    </button>
                  </div>
                </div>

                {/* Header Days */}
                <div className="grid grid-cols-7 gap-4 mb-6">
                  {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((dayName, idx) => (
                  <div key={idx} className="text-center pb-2">
                     <span className={`text-sm font-bold block ${idx < plans.length ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                       {idx < plans.length ? `Ngày ${idx + 1}` : dayName}
                     </span>
                  </div>
                ))}
                </div>

                {/* Grid Cells */}
                <div className="space-y-4 relative">
                  {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                   <div key={mealType} className="grid grid-cols-7 gap-4">
                      {Array.from({ length: 7 }).map((_, dayIdx) => {
                         const hasPlan = dayIdx < plans.length;
                         const mealData = hasPlan ? plans[dayIdx][mealType as keyof Omit<DayPlan, 'day'>] : null;
                         const isSelected = selectedMeal?.dayIdx === dayIdx && selectedMeal?.type === mealType;

                         if (!hasPlan || !mealData) {
                           return (
                             <div key={dayIdx} className="aspect-[3/4] md:h-36 rounded-3xl border-2 border-dashed border-outline-variant/60 bg-transparent flex items-center justify-center opacity-30">
                               <PlusIcon size={24} className="text-on-surface-variant/50" />
                             </div>
                           );
                         }

                         return (
                           <button
                             key={dayIdx}
                             onClick={() => setSelectedMeal({ dayIdx, type: mealType as any, data: mealData })}
                             className={`aspect-[3/4] md:h-auto h-36 px-3 py-4 rounded-3xl flex flex-col transition-all text-left relative overflow-hidden group
                               ${isSelected 
                                 ? 'bg-primary ring-2 ring-primary ring-offset-2 text-white shadow-xl' 
                                 : 'bg-white border hover:border-primary/50 shadow-sm border-outline-variant/40'
                               }`}
                           >
                              {/* Cập nhật Background Image nếu có (ở đây xài Unsplash với từ khoá ngẫu nhiên hoặc imageKeyword) */}
                              {isSelected ? (
                                <div className="absolute inset-0 bg-black/20 z-0" />
                              ) : null}

                              <div className="relative z-10 w-full flex flex-col h-full items-start justify-between">
                                {/* Label bữa ăn */}
                                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wider mb-2
                                  ${isSelected ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-primary/10 text-primary'}`}>
                                  {mealType === 'breakfast' && 'Sáng'}
                                  {mealType === 'lunch' && 'Trưa'}
                                  {mealType === 'dinner' && 'Tối'}
                                </div>

                                {/* Avatar Hình ảnh của món được dùng qua API Unsplash */}
                                {mealData.imageKeyword && (
                                   <div className={`size-10 rounded-full mt-1 mb-2 border-2 object-cover overflow-hidden
                                     ${isSelected ? 'border-primary-container shadow-md' : 'border-surface shadow-sm'}
                                   `}>
                                     <img src={`https://source.unsplash.com/random/100x100/?${mealData.imageKeyword},food`} alt={mealData.name} className="size-full object-cover" />
                                   </div>
                                )}

                                {/* Tên món ăn */}
                                <h4 className={`text-xs md:text-sm font-bold line-clamp-2 md:line-clamp-3 leading-snug w-full mb-1 ${isSelected ? 'text-white' : 'text-on-surface'}`}>
                                  {mealData.name}
                                </h4>

                                {/* Calo */}
                                <div className={`mt-auto text-[10px] font-bold flex items-center gap-1 ${isSelected ? 'text-white/80' : 'text-on-surface-variant'} `}>
                                   <Zap size={10} className={isSelected ? 'fill-white' : 'fill-outline'} />
                                   {mealData.calories} kcal
                                </div>
                              </div>
                           </button>
                         )
                      })}
                   </div>
                ))}
                </div>
              </div>

              {/* Right side: Grocery List & Detail */}
              <div className="w-full lg:w-[320px] lg:flex-shrink-0 flex flex-col gap-6">
                {/* Shopping List Card */}
                <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-lg text-on-surface">Danh sách cần mua</h3>
                   <span className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                     {plans.reduce((acc, curr) => acc + curr.breakfast.suggestedProducts.length + curr.lunch.suggestedProducts.length + curr.dinner.suggestedProducts.length, 0)}
                   </span>
                 </div>

                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {plans.map(p => [...p.breakfast.suggestedProducts, ...p.lunch.suggestedProducts, ...p.dinner.suggestedProducts]).flat().slice(0, 10).map((prod, i) => (
                      <label key={i} className="flex items-start gap-3 group cursor-pointer">
                        <div className="relative mt-0.5">
                          <input type="checkbox" defaultChecked={i < 2} className="peer appearance-none size-5 border-2 border-outline-variant rounded-md checked:border-primary checked:bg-primary transition-colors cursor-pointer" />
                          <Check size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors block leading-tight">{prod}</span>
                          <span className="text-xs text-on-surface-variant font-medium opacity-70">Gợi ý AI</span>
                        </div>
                      </label>
                    ))}
                 </div>

                 <div className="mt-8 pt-6 border-t border-outline-variant/50">
                   <button className="w-full bg-secondary-container text-on-secondary-container h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-105 transition-all">
                     <ShoppingCart size={18} /> Thêm vào giỏ hàng
                   </button>
                 </div>
                </div>

                {/* Meal Detail (If selected) */}
                <AnimatePresence>
                  {selectedMeal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-primary/5 rounded-[2.5rem] p-6 border border-primary/20 relative overflow-hidden"
                    >
                      <div className="absolute top-4 right-4 text-primary/20"><Info size={40} /></div>
                      <span className="inline-block px-3 py-1 bg-white text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border border-primary/20">
                        Chi tiết món ăn
                      </span>
                      <h3 className="text-lg font-bold text-on-surface mb-2 leading-tight pr-8">{selectedMeal.data.name}</h3>
                      <p className="text-sm text-on-surface-variant mb-4 italic leading-relaxed">"{selectedMeal.data.instructions}"</p>

                      <div className="space-y-2">
                         <p className="text-xs font-bold text-on-surface">Nguyên liệu:</p>
                         <ul className="text-sm text-on-surface-variant space-y-1 list-disc pl-4">
                           {selectedMeal.data.ingredients.slice(0,4).map((ing, i) => (
                             <li key={i}>{ing}</li>
                           ))}
                         </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Plus({ size, className }: { size: number, className: string }) {
  return <Sparkles size={size} className={className} />;
}
