import { apiRequest, toJsonBody } from "./apiClient";

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  unitPrice: number;
  unit?: string | null;
  quantity: number;
  subtotal: number;
  addedAt?: string;
  // Support multiple possible field names for image URL from backend
  imageUrl?: string | null;
  productImageUrl?: string | null;
  image?: string | null;
  thumbnailUrl?: string | null;
}

export const getCartItemImage = (item: CartItem): string => {
  return item.imageUrl || item.productImageUrl || item.image || item.thumbnailUrl || "";
};

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

export const addCartItem = async (productId: string | number, quantity = 1) => {
  const result = await apiRequest<Cart>("/carts/items", {
    method: "POST",
    body: toJsonBody({ productId: Number(productId), quantity }),
    requireAuth: true,
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: result }));
  }
  return result;
};

// Backend PATCH body = new total quantity (absolute, not delta).
// newQuantity must be >= 1; backend sets 1 if value would go below 1.
export const setCartItemQuantity = async (productId: string | number, newQuantity: number) => {
  const result = await apiRequest<Cart>(`/carts/items/${productId}`, {
    method: "PATCH",
    body: toJsonBody({ quantity: newQuantity }),
    requireAuth: true,
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: result }));
  }
  return result;
};

export const removeCartItem = async (productId: string | number) => {
  const result = await apiRequest<Cart>(`/carts/items/${productId}`, {
    method: "DELETE",
    requireAuth: true,
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: result }));
  }
  return result;
};

export const clearCart = async () => {
  const result = await apiRequest<Cart>("/carts/me", {
    method: "DELETE",
    requireAuth: true,
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: result }));
  }
  return result;
};
