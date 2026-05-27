import type { Product, ProductsApiResponse, ProductsPage, RawProduct } from '@/types/product';

const API_URL = 'http://localhost:8080/api/v1';

const normalizeProduct = (product: RawProduct): Product => {
  return {
    id: String(product.id),
    name: product.name,
    price: product.price,
    image: product.imageUrl,
    category: product.category.name,
    description: product.description,
    organic: true,
    allergens: product.allergens ?? [],
  };
};

export const getProducts = async (page = 0, size = 10): Promise<ProductsPage> => {
  const response = await fetch(`${API_URL}/products?page=${page}&size=${size}`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const payload = (await response.json()) as ProductsApiResponse;
  const items = payload.data.content.map(normalizeProduct);
  const { number, size: responseSize, totalPages, totalElements } = payload.data;

  return {
    items,
    page: number,
    size: responseSize,
    totalPages,
    totalElements,
  };
};

export const getProductById = async (id: string | number): Promise<Product> => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }

  const payload = await response.json();
  // API might return the raw product directly or wrapped in { data: ... }
  const raw: RawProduct = payload?.data ?? payload;

  return normalizeProduct(raw);
};


