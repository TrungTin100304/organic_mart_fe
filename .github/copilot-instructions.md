# Project Architecture

## Stack
- React + TypeScript + Vite
- Routing: React Router v6
- Styling: Tailwind CSS (hoặc thay bằng stack bạn dùng)
- State: React Context + hooks (hoặc Zustand / Redux Toolkit)
- HTTP: fetch / axios qua `services/`

---

## Cấu trúc thư mục

```
src/
├── pages/           # Route-level views (1 file = 1 URL)
├── features/        # Nhóm theo nghiệp vụ, tự chứa
├── components/      # UI thuần, dùng lại toàn app
├── hooks/           # Custom hooks dùng chung
├── services/        # Gọi API, không React
├── types/           # TypeScript interfaces & types
├── utils/           # Hàm helper thuần JS
├── App.tsx          # Root component
├── main.tsx         # Entry point
└── router.tsx       # Định nghĩa routes
```

---

## Quy tắc import (quan trọng nhất)

Tầng trên có thể import tầng dưới. **Không bao giờ ngược lại.**

```
pages → features → components → hooks → services → types / utils
```

Vi phạm quy tắc này sẽ tạo circular dependency và khó refactor sau này.

---

## Từng tầng

### `pages/`
- 1 file = 1 route.
- Chỉ làm: lấy data từ hook/feature, truyền vào component, render layout.
- **Không** chứa logic nghiệp vụ, không gọi API trực tiếp.

```tsx
// pages/ProductPage.tsx
const ProductPage = () => {
  const { products, isLoading } = useProducts();
  if (isLoading) return <Spinner />;
  return <ProductList products={products} />;
};
export default ProductPage;
```

---

### `features/`
Mỗi feature là một "mini-app" tự chứa. Cấu trúc bên trong:

```
features/
├── auth/
│   ├── components/    # UI chỉ dùng trong feature này
│   ├── hooks/         # Logic riêng của feature
│   ├── services/      # API call riêng (nếu cần tách)
│   └── types/         # Types riêng
└── product/
    ├── components/
    ├── hooks/
    └── types/
```

- Feature chỉ export ra ngoài những gì page cần (component, hook).
- Feature **không** import feature khác. Nếu cần chia sẻ → chuyển lên `components/` hoặc `hooks/`.

---

### `components/`
- UI thuần: Button, Input, Modal, Card, Spinner, Table...
- Nhận data qua props, không tự gọi API.
- Không biết gì về business logic hay features.
- Mỗi component đi kèm file types ngay cạnh nó nếu props phức tạp.

```tsx
// components/Button.tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
```

---

### `hooks/`
- Custom hooks dùng được ở nhiều nơi trong app.
- Ví dụ: `useLocalStorage`, `useDebounce`, `useFetch`, `useMediaQuery`.
- Không chứa logic của một feature cụ thể (cái đó để trong `features/*/hooks/`).

```ts
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T { ... }
```

---

### `services/`
- Toàn bộ HTTP request tập trung tại đây.
- Trả về typed data, xử lý lỗi cơ bản.
- **Không** import bất kỳ thứ gì từ React.

```ts
// services/productService.ts
import type { Product } from '@/types/product';

export const getProducts = async (): Promise<Product[]> => {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};
```

---

### `types/`
- Chứa interfaces và types dùng chung toàn app.
- Mỗi domain 1 file: `user.ts`, `product.ts`, `api.ts`...
- **Không** import từ bất kỳ tầng nào khác.

```ts
// types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}
```

---

### `utils/`
- Hàm helper thuần JavaScript, không phụ thuộc React.
- Ví dụ: `formatCurrency`, `validateEmail`, `truncateText`, `groupBy`.
- Phải có unit test nếu logic phức tạp.
- **Không** import từ bất kỳ tầng nào khác.

```ts
// utils/format.ts
export const formatCurrency = (amount: number, currency = 'VND') =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
```

---

## Alias import

Dùng `@/` thay vì đường dẫn tương đối dài:

```ts
// ✅ Tốt
import { Button } from '@/components/Button';
import type { Product } from '@/types/product';

// ❌ Tránh
import { Button } from '../../../components/Button';
```

Cấu hình trong `vite.config.ts` và `tsconfig.json`.

---

## Naming conventions

| Thứ | Convention | Ví dụ |
|-----|-----------|-------|
| Component file | PascalCase | `ProductCard.tsx` |
| Hook file | camelCase, prefix `use` | `useProducts.ts` |
| Service file | camelCase, suffix `Service` | `productService.ts` |
| Type/Interface | PascalCase | `interface Product {}` |
| Util function | camelCase | `formatCurrency()` |
| CSS module | same as component | `ProductCard.module.css` |

---

## Checklist khi thêm tính năng mới

- [ ] Tính năng đủ lớn (>1 component + 1 hook) → tạo `features/<tên>/`
- [ ] Chỉ là UI đơn giản → thêm vào `components/`
- [ ] Mọi API call đi qua `services/`
- [ ] Types được định nghĩa trong `types/` hoặc `features/*/types/`
- [ ] Không import ngược chiều trong hierarchy
- [ ] Không để logic trong `pages/`, chỉ để ở hooks/features