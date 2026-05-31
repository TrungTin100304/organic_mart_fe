export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image: string;
  imageUrl?: string;
  category: string;
  categoryId?: string;
  description: string;
  storageInstructions?: string;
  detailedDescription?: string;
  unit?: string;
  nutritionPer100g?: Record<string, unknown>;
  organic: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  stock?: number;
  allergens?: Array<{ id: number; name: string; createdAt?: string }>;
  isNew?: boolean;
  sale?: boolean;
  rating?: number;
  reviews?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Khoai mỡ Organic 300gr",
    price: 27000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB73AcS-JD25uMmZdoFcEz89LayKENXT3XCmfkRv0g9nnB7ol4WCL2A5b33NQtfiIC_mIQMe6pgsIbZF3npUxQDeM9tFD6tNr2wW1qmBolRAt2uicHETIRk6fuc1mKwXYpNW4nNAZV3qu3zwK-QE9WdJbCuGFXJE-lI08n2AbeUC6qLESNU3JII1EB4GX45js1pbe3XZLzL8oYuyZ57MLicqXIbhmVL8rOPN5yeCKuEdYKnvnD3uW1KsnK-BT0fjSBFp_c66OehAHE",
    category: "Vegetables",
    description: "Khoai mỡ hữu cơ giàu dinh dưỡng, vị bùi ngọt tự nhiên. Phù hợp cho món canh hoặc hấp. Sản phẩm được trồng hoàn toàn theo phương pháp hữu cơ.",
    organic: true,
    rating: 4.5,
    reviews: 48
  },
  {
    id: "2",
    name: "Cải kale (Xoăn) Organic 300gr",
    price: 36000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9m5uPnZlHhYL9s4JC5mi66qTVbXlV6EmIFhF0qsH_WG158Eb2jBL9eKU_Rv5wCuwJjn0KN2Sbi1nVg-ku-XUWIS4lkO4EVYXogsLqGTc4RrzSUyWO2gTeQeJh7SvPAwoExswTBU_Tkk2I8QwO44YKx-Th011RQXw8dRceWGlbTFBvMlfGQTKDeg-NZ4BEovJ2sGKrBWyJeJZRLqobvy4dY-RUJPY7lCT6kCxLIf60g38CeLTMxNYbe30ixroEr68QJDfEFocFKVE",
    category: "Vegetables",
    description: "Cải xoăn hữu cơ tươi giòn, giàu vitamin và khoáng chất.",
    organic: true,
    isNew: true
  },
  {
    id: "3",
    name: "Giá sạch ủ cát 300gr",
    price: 27000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7hG1vM8LMt2kzluUR5k-PQrNosw1MIO8TqCXe6hSxYCIt9N10np-hJVFqhCm_dtqS1BJxCPoir8lxGvMFV_gBQu8XdKBgBuZoOOdJAR37yTu4Z-INyo5DT_kPTZgtCnErC6T_ti_60w0_Man83WOfZOQi-hvemnNwxh_xaUkSc3F8ItNvMGeyaI_AskIQ3gdMjqs4LZEuO1sTs50WUCxWhi_UAdLk-4MBvjdSul0x9FK_RB8rOfvR9tDz46JVJUO7zf5leRE2Co4",
    category: "Vegetables",
    description: "Giá đỗ sạch được ủ theo phương pháp truyền thống.",
    organic: true
  },
  {
    id: "4",
    name: "Ớt chuông đỏ Organic 300gr",
    price: 50000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZum_1Jt4Ll2jAuOvza_lQrJnud-mXa3omZDC7wT1k7_fG7UaIoz3lSNjA8BLfba_JmIuPy-vinOqKsR70WComGo3Bw3KIhYn3fEJF1LRq3TwqLnScwatI1hvhBfPK3lrqQn1-aOrpU8AzVkjnEAhHJS5mFhcR4KBUWO1w8tdpH4hfi2QSqvGqR5CxCr9DiBXpCrUCtqyEFmISLa1HYdqn7iFYxugsWYOqofOK6XoegB_Qps9QkhW7arrXf9f5rTAwhlV9GumtVkI",
    category: "Vegetables",
    description: "Ớt chuông đỏ hữu cơ, vị ngọt thanh, giàu vitamin C.",
    organic: true
  },
  {
    id: "5",
    name: "Nấm hương tươi Green Kingdom",
    price: 45000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnVXAGu6Ef0SD9-VqtAFlFoG_2Cloo6A_VKsS-iH_YJvAG8wfv_MJEqrnIPadwrekgsy0Rb0ToyMf2FRLAGsOVBma3Zc14lm17piZPY2UUl7Buq1YYevzf7AAlDXlrISfBL5jRHakb9qDMrX9sSrLtyGfkb5yf8S9m-LFxXFdO0lxS3PNsQIBRQUO3Px1XLg1T6iD2-KlDgBU3UjvjkEbGXWM51GVnKmp2dH2WNc66xIU8xyZnaM0WRGYW3qxoh1x1N3O4fgVXBsM",
    category: "Vegetables",
    description: "Nấm hương tươi sạch, thơm ngon, giàu dinh dưỡng.",
    organic: true,
    sale: true
  },
  {
    id: "6",
    name: "Chanh Organic 300gr",
    price: 29000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUjOozyn6gWeAR4YhvphRs_RIogFx0Bm5Sv7X5BlKcPvnAwqqxBF82lAmW2DuGROKqwF7Vi0Qo0DM_beqFGzYIpYWdYLb3OtCCKZccM65_zZmP_CjhPEN9Bjhe7qsdSRBYuvQPe3d2l2X6liCkFXAHpgJZ3q0_8cou8UzKs51kIKmz7-7w1hh7K0tWyhx0QKuvdFxv1uQ18qZWQi402D9PavVDG99V5Ex6RIK9wfxWCUxvkL1GFxeNG-TxyIN5CSzT5Lbo2Rz0ZjA",
    category: "Vegetables",
    description: "Chanh hữu cơ mọng nước, vị chua thanh tự nhiên.",
    organic: true
  }
];
