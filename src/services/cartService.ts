import type { AddCartItemRequest, Cart, CartApiResponse } from '@/types/cart';

const API_URL = 'http://localhost:8080/api/v1/carts';

export const addCartItem = async (payload: AddCartItemRequest): Promise<Cart> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'Khong the them san pham vao gio hang';
    if (response.status === 401) {
      errorMessage = 'Ban chua dang nhap hoac token da het han';
    }
    if (response.status === 403) {
      errorMessage = 'Ban khong co quyen them vao gio hang';
    }
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || errorData?.error || errorMessage;
    } catch {
      // Ignore JSON parse error for non-JSON responses.
    }
    throw new Error(errorMessage);
  }

  const result = (await response.json()) as CartApiResponse | Cart;
  return ('data' in result ? result.data : result) as Cart;
};

export const getMyCart = async (): Promise<Cart> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let errorMessage = 'Khong the lay gio hang';
    if (response.status === 401) {
      errorMessage = 'Ban chua dang nhap hoac token da het han';
    }
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || errorData?.error || errorMessage;
    } catch {
      // Ignore JSON parse error for non-JSON responses.
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return ('data' in result ? result.data : result) as Cart;
};

export const updateCartItem = async (itemId: number, quantity: number): Promise<Cart> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  const response = await fetch(`${API_URL}/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    let errorMessage = 'Khong the cap nhat gio hang';
    if (response.status === 401) {
      errorMessage = 'Ban chua dang nhap hoac token da het han';
    }
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || errorData?.error || errorMessage;
    } catch {
      // Ignore JSON parse error for non-JSON responses.
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return ('data' in result ? result.data : result) as Cart;
};

export const removeCartItem = async (itemId: number): Promise<Cart> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  const response = await fetch(`${API_URL}/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      Accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let errorMessage = 'Khong the xoa san pham khoi gio hang';
    if (response.status === 401) {
      errorMessage = 'Ban chua dang nhap hoac token da het han';
    }
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || errorData?.error || errorMessage;
    } catch {
      // Ignore JSON parse error for non-JSON responses.
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return ('data' in result ? result.data : result) as Cart;
};
