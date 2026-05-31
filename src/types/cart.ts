export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartApiItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  imageUrl: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  subtotal: number;
  addedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  totalQuantity: number;
  totalPrice: number;
  distinctItemCount: number;
  updatedAt: string;
  items: CartApiItem[];
}

export interface CartApiResponse {
  data?: Cart;
  message?: string;
  status?: number;
}

