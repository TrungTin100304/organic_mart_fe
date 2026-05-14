import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is not defined. Please add it to your .env file.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface Meal {
  name: string;
  ingredients: string[];
  instructions: string;
  suggestedProducts: string[];
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export async function generateMealPlan(preferences: string): Promise<DayPlan[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Hãy tạo một kế hoạch thực đơn sức khỏe hữu cơ trong 3 ngày dựa trên sở thích của người dùng: "${preferences}". 
  Đối với mỗi bữa ăn, hãy gợi ý các sản phẩm hữu cơ cụ thể có thể tìm thấy ở cửa hàng thực phẩm hữu cơ.
  YÊU CẦU: Tất cả nội dung văn bản (tên món ăn, hướng dẫn, nguyên liệu) PHẢI bằng TIẾNG VIỆT.
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
                suggestedProducts: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "ingredients", "instructions", "suggestedProducts"]
            },
            lunch: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.STRING },
                suggestedProducts: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "ingredients", "instructions", "suggestedProducts"]
            },
            dinner: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.STRING },
                suggestedProducts: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "ingredients", "instructions", "suggestedProducts"]
            }
          },
          required: ["day", "breakfast", "lunch", "dinner"]
        }
      }
    }
  });

  try {
    const text = typeof response.text === 'function' ? await response.text() : response.text;
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
