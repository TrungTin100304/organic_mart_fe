import { apiRequest, toJsonBody } from "./apiClient";

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  imageUrl?: string | null;
  unitPrice: number;
  unit?: string | null;
  quantity: number;
  subtotal: number;
  addedAt?: string;
}

export interface Cart {
  id: number;
  userId: number;
  totalQuantity: number;
  totalPrice: number;
  distinctItemCount: number;
  updatedAt?: string;
  items: CartItem[];
}

export const getCurrentCart = () => apiRequest<Cart>("/carts/me", { requireAuth: true });

export const addCartItem = (productId: string | number, quantity = 1) =>
  apiRequest<Cart>("/carts/items", {
    method: "POST",
    body: toJsonBody({ productId: Number(productId), quantity }),
    requireAuth: true,
  });

// Backend currently subtracts this quantity from the item.
export const decreaseCartItem = (productId: string | number, quantity = 1) =>
  apiRequest<Cart>(`/carts/items/${productId}`, {
    method: "PATCH",
    body: toJsonBody({ quantity }),
    requireAuth: true,
  });

export const removeCartItem = (productId: string | number) =>
  apiRequest<Cart>(`/carts/items/${productId}`, {
    method: "DELETE",
    requireAuth: true,
  });

export const clearCart = () =>
  apiRequest<Cart>("/carts/me", {
    method: "DELETE",
    requireAuth: true,
  });
