import { apiRequest, toJsonBody } from "./apiClient";
import type { PageResponse } from "./adminOrderService";

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  userFullName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export const getProductReviews = (productId: string | number, page = 0, size = 10) =>
  apiRequest<PageResponse<ProductReview>>(
    `/reviews/products/${productId}?page=${page}&size=${size}`,
    { requireAuth: false },
  );

export const createReview = (data: {
  productId: number;
  orderId: number;
  rating: number;
  comment?: string;
}) =>
  apiRequest<ProductReview>("/reviews", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const reportReview = (id: number, reason: string) =>
  apiRequest<void>(`/reviews/${id}/report`, {
    method: "POST",
    body: toJsonBody({ reason }),
    requireAuth: true,
  });
