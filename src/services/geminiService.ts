import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  try {
    return import.meta.env.VITE_GEMINI_API_KEY;
  } catch (e) {
    // fallback for environments where import.meta.env is not available
    return typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
  }
};

const apiKey = getApiKey();

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is not defined. Please add it to your .env file.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface Meal {
  name: string;
  ingredients: string[];
  instructions: string;
  suggestedProducts: string[];
  calories: number;
  imageKeyword: string;
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export async function generateMealPlan(preferences: string): Promise<DayPlan[]> {
  const model = "gemini-3-flash-preview";

  const prompt = `Hãy tạo một kế hoạch thực đơn sức khỏe hữu cơ trong 7 ngày dựa trên sở thích của người dùng: "${preferences}".
  Đối với mỗi bữa ăn, hãy cung cấp tên món, hướng dẫn, nguyên liệu, và sản phẩm hữu cơ gợi ý.
  Đồng thời, ước tính lượng calo (calories) cho mỗi bữa ăn (khoảng 300-700).
  Đối với tập tin ảnh (imageKeyword), hãy cung cấp một từ khóa tiếng Anh NGẮN GỌN (1-2 từ) mô tả món ăn (ví dụ: "salad", "soup", "bread", "oatmeal") để làm từ khóa tìm kiếm ảnh.
  YÊU CẦU: Ngoại trừ imageKeyword, tất cả nội dung văn bản khác (tên món ăn, hướng dẫn, nguyên liệu) PHẢI bằng TIẾNG VIỆT.
  Đầu ra phải là một danh sách JSON có cấu trúc cho 3 ngày.`;

  if (!ai) {
    throw new Error("Gemini AI is not initialized. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            breakfast: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.STRING },
                suggestedProducts: { type: Type.ARRAY, items: { type: Type.STRING } },
                calories: { type: Type.INTEGER },
                imageKeyword: { type: Type.STRING }
              },
              required: ["name", "ingredients", "instructions", "suggestedProducts", "calories", "imageKeyword"]
            },
            lunch: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.STRING },
                suggestedProducts: { type: Type.ARRAY, items: { type: Type.STRING } },
                calories: { type: Type.INTEGER },
                imageKeyword: { type: Type.STRING }
              },
              required: ["name", "ingredients", "instructions", "suggestedProducts", "calories", "imageKeyword"]
            },
            dinner: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.STRING },
                suggestedProducts: { type: Type.ARRAY, items: { type: Type.STRING } },
                calories: { type: Type.INTEGER },
                imageKeyword: { type: Type.STRING }
              },
              required: ["name", "ingredients", "instructions", "suggestedProducts", "calories", "imageKeyword"]
            }
          },
          required: ["day", "breakfast", "lunch", "dinner"]
        }
      }
    }
  });

  try {
    // `response.text` may be a getter property (string) or a function depending on SDK/version.
    const rawText = (response as any).text;
    const text = typeof rawText === 'function' ? await rawText.call(response) : rawText;
    if (!text) {
      console.error("Gemini returned an empty response.");
      return [];
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse meal plan JSON", e);
    return [];
  }
}
