import type { ProductCategory } from '../types/product';

const API_URL = 'http://localhost:8080/api/v1';

export interface CategoryApiResponse {
  data: ProductCategory[];
  message: string;
  status: number;
}

export const getCategories = async (): Promise<ProductCategory[]> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch(`${API_URL}/product-categories`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product categories');
  }

  const payload = (await response.json()) as CategoryApiResponse;
  return payload.data;
};
