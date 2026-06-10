import { apiRequest, toJsonBody } from "./apiClient";
import type { PageResponse } from "./adminOrderService";

export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userFullName: string;
  rating: number;
  comment: string | null;
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface AdminReviewPage extends PageResponse<AdminReview> {}

export const getAdminReviews = (params?: {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  size?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 20));
  return apiRequest<AdminReviewPage>(`/reviews/admin?${query}`, { requireAuth: true });
};

export const approveReview = (id: number) =>
  apiRequest<void>(`/reviews/admin/${id}/approve`, {
    method: "PATCH",
    requireAuth: true,
  });

export const rejectReview = (id: number) =>
  apiRequest<void>(`/reviews/admin/${id}/reject`, {
    method: "PATCH",
    requireAuth: true,
  });
