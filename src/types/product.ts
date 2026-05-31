export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  organic: boolean;
  allergens?: string[];
  isNew?: boolean;
  sale?: boolean;
  rating?: number;
  reviews?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  createdAt: string;
}

export interface NutritionPer100g {
  fat?: string;
  carbs?: string;
  fiber?: string;
  protein?: string;
  calories?: number;
  omega_3?: string;
  calcium?: string;
  [key: string]: string | number | undefined;
}

export interface RawProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: string;
  nutritionPer100g: NutritionPer100g;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: ProductCategory;
  allergens: string[];
}

export interface PaginatedData<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
}

export interface ProductsApiResponse {
  data: PaginatedData<RawProduct>;
  message: string;
  status: number;
}

export interface ProductsPage {
  items: Product[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export type ProductApiTypes = {
  raw: RawProduct;
  payload: ProductsApiResponse;
  page: ProductsPage;
  cartItem: CartItem;
};



