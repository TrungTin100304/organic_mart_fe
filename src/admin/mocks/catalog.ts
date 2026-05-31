import type { AdminCategory, AdminProduct } from "../types";

export const ADMIN_PRODUCTS: AdminProduct[] = [
  { id: "p1", name: "Khoai mo Organic 300gr", sku: "VEG-001", category: "Rau cu", price: 27000, stock: 150, status: "active", organic: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB73AcS-JD25uMmZdoFcEz89LayKENXT3XCmfkRv0g9nnB7ol4WCL2A5b33NQtfiIC_mIQMe6pgsIbZF3npUxQDeM9tFD6tNr2wW1qmBolRAt2uicHETIRk6fuc1mKwXYpNW4nNAZV3qu3zwK-QE9WdJbCuGFXJE-lI08n2AbeUC6qLESNU3JII1EB4GX45js1pbe3XZLzL8oYuyZ57MLicqXIbhmVL8rOPN5yeCKuEdYKnvnD3uW1KsnK-BT0fjSBFp_c66OehAHE", updatedAt: "2025-05-10", featured: true },
  { id: "p2", name: "Cai kale Organic 300gr", sku: "VEG-002", category: "Rau cu", price: 36000, stock: 8, status: "active", organic: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9m5uPnZlHhYL9s4JC5mi66qTVbXlV6EmIFhF0qsH_WG158Eb2jBL9eKU_Rv5wCuwJjn0KN2Sbi1nVg-ku-XUWIS4lkO4EVYXogsLqGTc4RrzSUyWO2gTeQeJh7SvPAwoExswTBU_Tkk2I8QwO44YKx-Th011RQXw8dRceWGlbTFBvMlfGQTKDeg-NZ4BEovJ2sGKrBWyJeJZRLqobvy4dY-RUJPY7lCT6kCxLIf60g38CeLTMxNYbe30ixroEr68QJDfEFocFKVE", updatedAt: "2025-05-12", isNew: true },
  { id: "p3", name: "Ot chuong do Organic 300gr", sku: "VEG-003", category: "Rau cu", price: 50000, salePrice: 42000, stock: 45, status: "active", organic: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZum_1Jt4Ll2jAuOvza_lQrJnud-mXa3omZDC7wT1k7_fG7UaIoz3lSNjA8BLfba_JmIuPy-vinOqKsR70WComGo3Bw3KIhYn3fEJF1LRq3TwqLnScwatI1hvhBfPK3lrqQn1-aOrpU8AzVkjnEAhHJS5mFhcR4KBUWO1w8tdpH4hfi2QSqvGqR5CxCr9DiBXpCrUCtqyEFmISLa1HYdqn7iFYxugsWYOqofOK6XoegB_Qps9QkhW7arrXf9f5rTAwhlV9GumtVkI", updatedAt: "2025-05-14" },
  { id: "p4", name: "Nam huong tuoi Green Kingdom", sku: "VEG-004", category: "Rau cu", price: 45000, stock: 3, status: "active", organic: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnVXAGu6Ef0SD9-VqtAFlFoG_2Cloo6A_VKsS-iH_YJvAG8wfv_MJEqrnIPadwrekgsy0Rb0ToyMf2FRLAGsOVBma3Zc14lm17piZPY2UUl7Buq1YYevzf7AAlDXlrISfBL5jRHakb9qDMrX9sSrLtyGfkb5yf8S9m-LFxXFdO0lxS3PNsQIBRQUO3Px1XLg1T6iD2-KlDgBU3UjvjkEbGXWM51GVnKmp2dH2WNc66xIU8xyZnaM0WRGYW3qxoh1x1N3O4fgVXBsM", updatedAt: "2025-05-08" },
  { id: "p5", name: "Chanh Organic 300gr", sku: "FRU-001", category: "Trai cay", price: 29000, stock: 200, status: "active", organic: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUjOozyn6gWeAR4YhvphRs_RIogFx0Bm5Sv7X5BlKcPvnAwqqxBF82lAmW2DuGROKqwF7Vi0Qo0DM_beqFGzYIpYWdYLb3OtCCKZccM65_zZmP_CjhPEN9Bjhe7qsdSRBYuvQPe3d2l2X6liCkFXAHpgJZ3q0_8cou8UzKs51kIKmz7-7w1hh7K0tWyhx0QKuvdFxv1uQ18qZWQi402D9PavVDG99V5Ex6RIK9wfxWCUxvkL1GFxeNG-TxyIN5CSzT5Lbo2Rz0ZjA", updatedAt: "2025-05-15", featured: true },
  { id: "p6", name: "Tao Fuji nhap khau 1kg", sku: "FRU-002", category: "Trai cay", price: 89000, salePrice: 75000, stock: 60, status: "active", organic: false, image: "", updatedAt: "2025-05-11" },
  { id: "p7", name: "Sua hanh nhan Organic 1L", sku: "DRY-001", category: "Sua & do uong", price: 120000, stock: 0, status: "out_of_stock", organic: true, image: "", updatedAt: "2025-05-06" },
  { id: "p8", name: "Granola huu co 500gr", sku: "DRY-002", category: "Do kho", price: 155000, stock: 25, status: "active", organic: true, image: "", updatedAt: "2025-05-13", isNew: true },
  { id: "p9", name: "Trung ga tha vuon (10 qua)", sku: "OTH-001", category: "Thuc pham khac", price: 65000, stock: 5, status: "active", organic: true, image: "", updatedAt: "2025-05-09" },
  { id: "p10", name: "Mat ong rung nguyen chat 500ml", sku: "OTH-002", category: "Thuc pham khac", price: 280000, stock: 18, status: "draft", organic: true, image: "", updatedAt: "2025-05-07" },
];

export const CATEGORIES: AdminCategory[] = [
  { id: "c1", name: "Rau cu", slug: "rau-cu", productCount: 24, image: "" },
  { id: "c2", name: "Trai cay", slug: "trai-cay", productCount: 18, image: "" },
  { id: "c3", name: "Sua & do uong", slug: "sua-do-uong", productCount: 12, image: "" },
  { id: "c4", name: "Do kho", slug: "do-kho", productCount: 15, image: "" },
  { id: "c5", name: "Thuc pham khac", slug: "thuc-pham-khac", productCount: 9, image: "" },
];
